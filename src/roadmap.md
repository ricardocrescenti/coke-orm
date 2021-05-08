# CokeORM

## Geral

* **04** - [ ] No TableManager criar método para efetuar count passando um findOptions sem select, relations, orderBy, roles.
* **02** - [x] Nas relaçòes com filhos quando salvar, se não mandar um objeto que tinha antes, deletar ele, se tiver cascade['delete']
* **03** - [ ] Permitir inicializar o CokeORM a partir de um arquivo de configuração
* **05** - [ ] Criar a tabela "migrations" para gerenciar as migrações do banco de dados
* **23** - [ ] Estudar uma forma de gerar as triggers, procedures e views pelo ORM
* **09** - [ ] Passar por todo o ORM validando e adicionando os comentários nos métodos

## Find

* **99** - [ ] Carregar as relações com base na necessidade das condiçoes e ordenação.
   - No TableManager.find adicionar as relações automáticamente
   - No QueryBuild validar se falta alguma relação para o caso do cliente montar a query manualmente 
* **22** - [ ] Ver para criar "rules" a nivel de linha, neste caso o cara pode adiconar um SQL ou uma condição JavaScript, permissões.

## Save

* **21** - [ ] Criar um saveOptions, aonde o cara poderá adicionar os eventos: beforeSave, afterSave, beforeLoadPrimaryKey, afterLoadPrimaryKey especificos para uma função

## Cli

* **06** - [ ] Comandos: migrations(generate,create)
* **08** - [ ] Carregar as classes de pastas
* **07** - [ ] Gerar as migrAtions em arquivos
- 
