# CokeORM

## Geral

* Implementar o método "validade" no subscriber
* Quando o default do campo é uma string, não está adicionando as aspas simples na migration
* Implementar 'validators' nas colunas
* Validar se vai gerar duas tabelas com o mesmo nome
* Analisar porque ele manda deletar PK nas migrations sem ter elas criadas em alguns casos (marketplace)
* Validar caso seja adicionado uma mesma unique ou indice na mesma tabela
* Colocar parâmetro para que caso uma coluna não esteja mapeada e seja NOT NULL, alterar ela e permitir NULL.
* Quando é atualizadca uma tabela que já existe pode dar erro na hora de apagar as chaves primeiras, exemplo alteração da order_invoice
* Analisar a validação dos enumerados, quando passa o indice dele em formato de string
* Da erro quando uma query param tem quebra de linha.
* Está dando conflito nos relations quando tem o select informado, ele ignora as relations que as vezes são usados no where
* No FindOptios.where quando for filho, filtrar os filhos também.
* No FindOne colocar o parâmetro 'runEventAfterLoad' dentro do findOptions e mudar o nome para 'allowSubscriber'.
* No FindOptions where poder usar um valor de relação que dai pegaria automaticamente o campo relacionado para fazer o where.
* Verificar o método loadPrimaryKey para não criar as classes porque o objeto inteiro deveria estar criado pelo método EntityManager.create.
* Associar ao método createEntity o método EntityManager.create para que não seja necessário passar parametros adicionais no método create.
* Criar um erro quando o método createEntity da relation não retornar nada.
* Mudar o nome do EntitySubscriberInterface para EventsInterface que ai fica parecido com o EventsSubscriber.
* Adicionar uma validação para dar erro caso não ache alguma entidade solicitada no método Decorators.getEntities
* Conferir todas as classes de Schema se elas tem a propriedade "schema" para usar na hora de deletar os objetos
* Testar o operador 'DeletedIndicator'
* Melhorar o método save, ficar o processo principal no EntityManager
* Ajustar para o tipo do campo ficar por padrão integer quando a propriedade for number e não tiver precision
* Implementar as rules a nivel de linha
* Implementar o operador not no where
* Melhorar o método create que pode ser mudado criando pela relation.createEntity

* **02** - [x] Nas relaçòes com filhos quando salvar, se não mandar um objeto que tinha antes, deletar ele, se tiver cascade['delete']
* **03** - [x] Permitir inicializar o CokeORM a partir de um arquivo de configuração
* **04** - [x] Carregar as classes de pastas
* **07** - [x] Criar a tabela "migrations" para gerenciar as migrações do banco de dados
* **08** - [x] Não inserir os wheres nas tabelas filhas, pois as condições estarão somente na tabela principal, e nas filhas ficará somente no select
* **09** - [x] Passar por todas as propriedades das colunas e tabelas para ver se tem alguma proprietade sem uso e implementar ou remover
* **10** - [x] Implementar o eager das relations.
* **11** - [x] Implementar o uso de enumerados nos campos
* **12** - [x] Implementar o uso de eventos em uma classe separada do model
* **13** - [ ] No TableManager criar método para efetuar count passando um findOptions sem select, relations, orderBy, roles.
* **14** - [ ] Criar propriedade no ColumnOptions para especificar o campo padrão do where caso não seja informado ficando tipo { entity: { equal: 1 } }
* **15** - [ ] Instalar o Jest para efetuar testes automatizados
* **16** - [ ] Criar classe de Log para mostrar os dados
* **19** = [ ] Desenvolver o procedimento de roolback das migrations.
* **20** - [ ] Passar por todo o ORM validando e adicionando os comentários nos métodos
* **23** - [ ] Estudar uma forma de gerar as triggers, procedures e views pelo ORM

## Find

* **01** - [ ] Ver para criar "rules" a nivel de linha, neste caso o cara pode adiconar um SQL ou uma condição JavaScript, permissões.
* **02** - [ ] Carregar as relações com base na necessidade das condiçoes e ordenação.
   - No TableManager.find adicionar as relações automáticamente
   - No QueryBuild validar se falta alguma relação para o caso do cliente montar a query manualmente 

## Save

* **01** - [ ] Criar um saveOptions, aonde o cara poderá adicionar os eventos: beforeSave, afterSave, beforeLoadPrimaryKey, afterLoadPrimaryKey especificos para uma função

## Cli

* **01** - [x] Comandos: migrations(generate,create,run)
* **02** - [x] Gerar as migrations em arquivos
- **03** - [ ] Comando init para criar o arquivo de configuração e pedir alguns dados iniciais
