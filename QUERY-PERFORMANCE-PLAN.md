# Plano de Melhoria: Consulta de busca de produtos (listagem com filtro em relações)

> Objetivo: eliminar o filtro tardio sobre subqueries agregadas de relações `OneToMany`,
> que transformava uma consulta de listagem paginada (LIMIT 25) em 13 minutos de execução
> (783 s no EXPLAIN ANALYZE), com 51,5 GB de leitura de temp files.

---

## 1. Contexto e diagnóstico (resumo da análise)

A consulta problemática (gerada pelo `find` do ORM com `relations` + `where` com condições
em relações `OneToMany` + `limit` + `orderBy`) faz **busca + ordenação + agregação JSON de
~10 relações numa única query**. O WHERE final referencia colunas booleanas **agregadas**
(`max(...)::int::boolean` com alias sha1) vindas das subqueries LEFT JOIN. Consequências:

1. O PostgreSQL é obrigado a agregar (`json_agg`) **todas** as relações dos ~115 mil produtos,
   ordenar tudo (`ORDER BY reference`, sort externo em disco) e só então filtrar 25 linhas.
2. O join com `children` (auto-relação OneToMany) virou Nested Loop com **100,6 milhões de
   comparações** (11.434 × 8.801), relendo a Materialize 11.434× (51 GB de temp).
3. EXISTS correlacionados dentro de cada subquery agregada executados dezenas/centenas de
   milhares de vezes.
4. Seq scan de `products` repetido ~18× (uma vez por subquery + uma por EXISTS).

**A solução escolhida (A + C):**

- **A. Query em duas fases** no ORM: (1) buscar os ids que satisfazem o filtro usando
  `EXISTS` (barato e indexável), com `ORDER BY` + `LIMIT`/`OFFSET`; (2) carregar as linhas
  e as relações **apenas desses ids**, restringindo as subqueries agregadas via
  `FK IN (ids)` (nível 1) e via `Filter.id IN (ids)` no exists do root filter (níveis
  profundos).
- **C. Índices** no banco (script SQL no final): índice parcial para o filtro raiz + ordem,
  GIN trigram para os ILIKE, e índices nas colunas FK das tabelas filhas.

**Não implementar agora (descartados):**
- B (trocar max()::boolean por EXISTS no WHERE raiz) — é um passo intermediário da A.
- D (work_mem) — mitigação apenas, não resolve a raiz.
- E (FTS/paginação por cursor/relações no detalhe) — mudanças de arquitetura do app.

---

## 2. Como o ORM gera a query hoje (mapa do código)

| Trecho | Local |
|---|---|
| `find()` executa a query | `src/manager/entity-manager.ts:318-348` |
| `createSelectQuery` (raiz) monta select/join/where/orderBy/limit | `src/manager/entity-manager.ts:472-552` |
| `buildRootFilterContext` achata o where "pushável" | `src/manager/entity-manager.ts:~900-1004` |
| Subquery OneToMany com `json_agg` + `max()::boolean` | `createChildSubquery` `src/manager/entity-manager.ts:820-860` |
| Subquery monta where pushdown + exists do root filter | `createSubquery` `src/manager/entity-manager.ts:686-804` (ajuste em 695-755) |
| Builder do `exists (...)` correlacionado | `QueryRootFilterColumnBuilder` `src/query-builder/column-builder/query-root-filter-column-builder.ts` |
| `mountChainCondition` (FK entre níveis) | `src/manager/entity-manager.ts:1098-1118` |
| Compilação do WHERE (`alias.column` suportado) | `QueryManager.decodeWhereCondition` `src/query-builder/query-manager.ts:167-248` |
| LIMIT/OFFSET | `src/query-builder/query-manager.ts:328-350` |
| `setFindOptionsDefaultOrderBy` (remove OneToMany do orderBy) | `src/manager/entity-manager.ts:1203-1234` |
| Testes do pushdown existente (referência) | `src/__tests__/92-where-pushdown/0101-where-pushdown.test.ts` |

Detalhe importante do `createSubquery` (linhas 695-755): condições de relação do where são
convertidas em colunas agregadas (`QueryWhereColumnBuilder` → `max(...)::boolean` com alias
sha1) dentro da subquery, e o where raiz passa a referenciar o alias agregado. **É esse
mecanismo que cria o filtro tardio.**

---

## 3. Implementação A — Query em duas fases

### 3.1 Novo builder: `src/query-builder/column-builder/query-exists-filter-column-builder.ts`

Classe `QueryExistsFilterColumnBuilder<T> extends QueryColumnBuilder<T>`, inspirada no
`QueryRootFilterColumnBuilder`, mas com o FROM **na tabela mais profunda da cadeia**
(onde está a condição), joins intermediários subindo até o filho direto da raiz, e a
correlação final no WHERE (`"filho"."fk" = "Raiz"."id"`).

```
exists (
  select 1
  from "<tabela_mais_profunda>" "<AliasProfundo>"
  [left join "<tabela_nível_anterior>" "<AliasAnterior>" on <fk> ...]  -- sobe a cadeia
  where "<filho_direto>"."<fk>" = "<RootAlias>"."<pk>"            -- correlação com a raiz externa
    and <condições compiladas por nível>)
```

Propriedades (todas passadas por constructor, como no builder existente):
- `fromExpression`: `from "schema"."<deepTable>" "<deepAlias>" [joins...]` (cadeia montada no entity-manager).
- `correlationExpression`: `"<childAlias>"."<fk>" = "<rootAlias>"."<pk>"`.
- `conditions`: objeto de condições no formato `"<alias>.<coluna_db>"` (o `decodeWhereCondition`
  já suporta `alias.column`, ver query-manager.ts:216-222).
- `rootAlias`: alias da tabela raiz da fase 1 (className da entidade raiz, ex: `ProductModel`).

`getExpression(mainQueryManager, queryManager, entityMetadata)`:
- cria um `QueryManager` com `entityMetadata` = entidade profunda? **não** — para compilar
  condições no formato `alias.column`, basta `table = { table: <deepTable>, alias: <deepAlias> }`
  e `entityMetadata` = metadata da entidade profunda (para validação de chaves comuns).
- registra parâmetros no `mainQueryManager` (ordem global).
- retorna `exists (select 1 ${fromExpression} where ${correlationExpression} and ${conditions})`.

Exportar no `src/query-builder/column-builder/index.ts` (e em `src/query-builder/index.ts` se
a pasta de column-builder tiver index).

### 3.2 `RootFilterContext` — novo campo opcional `parentIds`

`src/query-builder/column-builder/query-root-filter-column-builder.ts`:
- `public readonly parentIds?: any[];`
- constructor com 4º parâmetro opcional.

Propagação: em `createSubquery` (entity-manager.ts:762-765), o `subqueryRootFilter` copia o
contexto para o próximo nível e hoje **perde** campos — manter `parentIds` na cópia.

### 3.3 `find()` — fluxo das duas fases

`src/manager/entity-manager.ts` (método `find`, ~linha 318):

```
find(findOptions):
  findOptions = new FindOptions({...findOptions, queryRunner})

  let parentIds: any[] | undefined;
  if (this.shouldUseTwoPhaseQuery(findOptions)):
    idsQuery = this.createIdsQuery(findOptions)
    idsResult = await idsQuery.execute(findOptions.queryRunner)
    parentIds = idsResult.map(row => row[PK.propertyName])          // coluna do PK
    if (parentIds.length == 0): return []

    findOptions = new FindOptions({
      ...findOptions,
      where: { [PK.propertyName]: { in: parentIds }, AND: findOptions.where },
      skip: undefined,
      limit: undefined,
    })

  query = this.createSelectQuery(findOptions, 0, undefined, undefined, parentIds)
  result = await query.execute(findOptions.queryRunner)
  ... (restante igual: create + runAfterLoadEvent)
```

Justificativas:
- `AND: findOptions.where` — mantém o where original (semântica idêntica + segurança se houve
  mudança de dados entre as fases). `decodeWhereCondition` já suporta `AND` com objeto ou array.
- `skip`/`limit` removidos na fase 2 (a página já foi resolvida na fase 1; ORDER BY fica para
  ordenar o retorno). `{ ...idsWhere, AND: where }` com where **sempre** presente (a ativação
  exige condição de relação).
- `parentIds` é passado como 5º parâmetro do `createSelectQuery` (abaixo) para chegar ao
  `buildRootFilterContext` e às subqueries.

### 3.4 `createSelectQuery` — receber `parentIds`

Assinatura vira `createSelectQuery(findOptions?, level?, relationMetadata?, rootFilter?, parentIds?)`.
- No nível 0 (linha ~512-515): `rootFilterContext = this.buildRootFilterContext(findOptions, parentIds)`.
- `buildRootFilterContext` ganha parâmetro `parentIds` e o repassa ao `RootFilterContext`
  (com path `[]` — o que identifica subqueries nível 1).
- Subqueries herdam por cópia (3.2), mantendo path estendido.

### 3.5 `shouldUseTwoPhaseQuery` — ativação

Ativa somente quando o single query é realmente ruim e a fase 1 é possível:

1. `limit > 0` (sem limit não há ganho — fase 2 buscaria todos os ids).
2. `orderBy` sem colunas de relação (somente colunas raiz; `setFindOptionsDefaultOrderBy` já
   remove OneToMany, então checar se alguma chave do orderBy é coluna com relation → `false`).
3. Existe pelo menos uma condição de relação **OneToMany** no where (walk recursivo por
   `AND` e arrays). ManyToOne não ativa (subquery 1:1 é barata e já filtra cedo via inner join).

Walk recursivo auxiliar `hasRelationCondition(where, metadata)`:
- `RAW` → ignora; `AND` → recursão; chave é coluna com `relation?.type == 'OneToMany'` → true.

### 3.6 `createIdsQuery` — fase 1

```
createIdsQuery(findOptions):
  where = this.transformWhereForSearch(findOptions.where)
  return this.createSelectQuery({
    ...findOptions,
    select: [PK.propertyName],      // só a chave primária
    relations: [],                  // sem subqueries
    where,
  }, 0)
```

- `createSelectQuery` aplica `setFindOptionsDefaultOrderBy` (orderBy = PK se vazio) e o
  deletedAt (`isNull: true`) automaticamente — o orderBy/skip/limit originais são preservados.
- Resultado: `SELECT id FROM products WHERE <filtro transformado> ORDER BY reference LIMIT 25 [OFFSET n]`.

### 3.7 `transformWhereForSearch` — converter condições de relação em EXISTS

Walk recursivo espelhando `decodeWhereCondition`:

```
transformWhereConditions(where, metadata, path):
  if (Array.isArray(where)) -> map (cada item com mesmo metadata/path)   // OR preservado
  for key of where:
    RAW   -> copia
    AND   -> recursão com mesmo metadata/path
    coluna comum -> copia
    coluna com relation -> newPath = [...path, relation]
        transformed[key] = buildSearchExistsCondition(newPath, value)
```

`buildSearchExistsCondition(path, value)`:
1. **Entidades da cadeia**: `path[0].getReferencedEntityMetadata()` … `path[N-1]` (profunda).
2. **Aliases** (evitar colisão com a raiz externa e entre níveis):
   - nível i (1-based): `"${entity.className}_Filter${i}"` (ex.: `ProductBarcodeModel_Filter1`,
     para auto-relação `children`: `ProductModel_Filter1`).
3. **FROM** na entidade mais profunda (`path[N-1]`).
4. **Joins**: dos níveis profundos ao nível 1, usando `mountChainCondition(relation, childLevel, parentLevel)`
   (entity-manager.ts:1098) — já trata OneToMany/ManyToOne e direções de FK.
5. **Correlação final** no WHERE: `"<alias nível 1>"."<fk>" = "<RootAlias>"."<pk>"`
   (`mountChainCondition(path[0], level1, rootLevel)` com rootLevel = `{ entity: this.metadata, alias: this.metadata.className }`).
6. **Condições**: walk recursivo de `value` distribuindo por nível:
   - chave comum da entidade do nível atual → `{ "<alias>.<coluna_db>": valor }`;
   - chave com relation → desce o nível (path += relation);
   - `AND`/arrays preservados.
7. Retorna `new QueryExistsFilterColumnBuilder({ fromExpression, correlationExpression, conditions, rootAlias })`
   e o where da fase 1 usa `{ RAW: builder }` (o `decodeWhereCondition` aceita
   `QueryColumnBuilder` em RAW e registra os parâmetros — query-manager.ts:172-183).

Equivalência semântica (importante): o agregado `max(barcode ilike ...)::boolean = true` sobre
as linhas da subquery (restritas ao root filtrado) equivale a
`EXISTS (barcode daquele produto com ilike)` — porque a subquery é correlacionada ao próprio
produto raiz via FK, e o root da fase 1 já satisfaz o filtro raiz.

### 3.8 Otimização nível 1 — `FK IN (ids)` nas subqueries da fase 2

Em `createSubquery` (entity-manager.ts, após o bloco `adjustWhere`, ~linha 755), **somente
para OneToMany com `rootFilter.path.length == 0`**:

```
if (rootFilter?.parentIds && rootFilter.path.length == 0 && columnMetadata.relation?.type == 'OneToMany'):
    referencedColumn = relationEntityManager.metadata.columns[columnMetadata.relation.referencedColumn]
    parentIdsWhere = { [referencedColumn.propertyName]: { in: rootFilter.parentIds } }
    if (directWhereColumns.length > 0):
        directWhereColumns[0] = { ...directWhereColumns[0], ...parentIdsWhere }
    else:
        directWhereColumns.push(parentIdsWhere)
```

- `referencedColumn` = coluna FK na tabela filha (ex.: `products_barcodes.product_id`,
  `products.parent_id` para `children`) — mesma coluna usada no join em
  `loadQueryColumns` (entity-manager.ts:625-637).
- **Nunca** adicionar como novo item do array `directWhereColumns` (o `where()` com array vira
  OR entre itens — `decodeWhereConditions` junta com `' or '`). Sempre mesclar no item [0].
- Para níveis profundos (ex.: `children.barcodes`), o exists do root filter (com o
  `id: { in: parentIds }` injetado no `RootFilterContext.where` via `buildRootFilterContext`)
  restringe a cadeia: `Filter.id in (...)` vira hash semi join no plano — suficiente.
- Nível 1 fica index-driven: `WHERE "product_id" in ($1..$25)` → index scan no FK.

Por que o `{ id: { in } }` do where da fase 2 alcança as subqueries: `buildRootFilterContext`
achata `id` como condição comum, o `RootFilterContext.where` é compilado dentro do
`QueryRootFilterColumnBuilder.getExpression` (query-root-filter-column-builder.ts:94-114) —
cada subquery passa a ter `Filter.id in (...)` no exists body.

---

## 4. Implementação C — Índices (script SQL)

Aplicar no banco da aplicação (Postgres). Parciais para o filtro raiz
(`parent_id IS NULL AND status = 1` — ajustar nomes reais de colunas/tabelas se preciso).

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- raiz: filtro + ordenação (evita sort externo no ORDER BY reference)
CREATE INDEX IF NOT EXISTS idx_products_root_reference
  ON products (reference) WHERE parent_id IS NULL AND status = 1;

-- raiz: ILIKE em name/reference (fase 1)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops) WHERE parent_id IS NULL AND status = 1;
CREATE INDEX IF NOT EXISTS idx_products_reference_trgm
  ON products USING gin (reference gin_trgm_ops) WHERE parent_id IS NULL AND status = 1;

-- FK das tabelas filhas (EXISTS da fase 1 e FK IN da fase 2)
CREATE INDEX IF NOT EXISTS idx_products_barcodes_product   ON products_barcodes (product_id);
CREATE INDEX IF NOT EXISTS idx_products_prices_product     ON products_prices (product_id);
CREATE INDEX IF NOT EXISTS idx_products_suppliers_product  ON products_suppliers (product_id);
CREATE INDEX IF NOT EXISTS idx_products_images_product     ON products_images (product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_product              ON stocks (product_id);
CREATE INDEX IF NOT EXISTS idx_products_units_measure_product ON products_units_measure (product_id);
CREATE INDEX IF NOT EXISTS idx_products_packaging_product  ON products_packaging (product_id);
CREATE INDEX IF NOT EXISTS idx_products_parent             ON products (parent_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_entity            ON suppliers (entity_id);
CREATE INDEX IF NOT EXISTS idx_stocks_warehouse            ON stocks (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_files_annotations_file      ON files_annotations (file_id);

-- ILIKE '%brinco%' nas tabelas pesquisadas pelos EXISTS da fase 1
CREATE INDEX IF NOT EXISTS idx_products_barcodes_barcode_trgm
  ON products_barcodes USING gin (barcode gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_suppliers_reference_trgm
  ON products_suppliers USING gin (reference gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entities_name_trgm
  ON entities USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stocks_locale_trgm
  ON stocks USING gin (locale gin_trgm_ops);
```

> Observação: para tabelas muito grandes, usar `CREATE INDEX CONCURRENTLY` em produção.

---

## 5. Testes

**Unitários (sem banco):**
- `shouldUseTwoPhaseQuery`: ativa com OneToMany + limit; desativa sem limit, com orderBy de
  relação, sem condições de relação.
- `transformWhereForSearch` (via `createIdsQuery().getQuery()`):
  - condição OneToMany nível 1 → SQL contém `exists (select 1 from "products_barcodes" ... where "product_id" = "ProductModel"."id" ...)`;
  - condição aninhada (`children.barcodes`) → exists com join da cadeia;
  - AND/OR arrays preservados (condições comuns continuam no WHERE raiz);
  - sem condições de relação → where inalterado.

**Integração (padrão `src/__tests__/92-where-pushdown/`):** nova pasta
`src/__tests__/94-two-phase-query/0101-two-phase-query.test.ts`:
- salvar árvore de teste (produto com barcode, filho com barcode próprio);
- `find` com `where: { name: iLike, barcodes: { barcode: iLike } }` + `limit` → resultados
  corretos (mesmo conjunto com/sem o caminho de 2 fases);
- verificar que a fase 2 gera `"id" in ($...)` no where raiz e `"product_id" in ($...)` na
  subquery (SQL via `createSelectQuery` com parentIds, ou spy na execução);
- paginação (`skip` + `limit`) consistente.

**Verificação:** `npm run build` e `npm test` (jest; na máquina do dev a suíte exige Postgres
local `cokeorm/cokeorm@localhost`; para rodar só os novos testes:
`npx jest src/__tests__/94-two-phase-query`).

---

## 6. Regras de ouro / pegadinhas

1. **`where()` com array = OR** (`decodeWhereConditions` junta com `' or '`). Condições
   conjuntivas SEMPRE como objeto único (mesclar no item [0] de `directWhereColumns`).
2. **Aliases**: exists da fase 1 usa `"${className}_Filter${i}"` — nunca colidir com o alias
   da raiz (`className`) nem com `_Filter` do builder existente.
3. **Parâmetros**: todo builder de coluna deve registrar parâmetros no `mainQueryManager`
   (ordem global) — o `getExpression(mainQueryManager, ...)` recebe o manager da fase 1.
4. **Equivalência**: fase 1 e fase 2 aplicam o MESMO where (fase 2 = original + `id IN`).
5. **`createSelectQuery` continua gerando a query antiga** (usada em testes via `getQuery()`)
   — a lógica de 2 fases fica só no `find()`. Assinatura nova é backward-compatible
   (parâmetros opcionais).
6. **Non-goals**: não mudar `QueryRootFilterColumnBuilder` nem o pushdown existente; não
   alterar comportamento sem `limit`; não mexer em `findOne` (herda o benefício via `find`).