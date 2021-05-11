# CokeORM

## Geral

* **02** - [x] Nas relaçòes com filhos quando salvar, se não mandar um objeto que tinha antes, deletar ele, se tiver cascade['delete']
* **03** - [x] Permitir inicializar o CokeORM a partir de um arquivo de configuração
* **04** - [x] Carregar as classes de pastas
* **07** - [ok] Criar a tabela "migrations" para gerenciar as migrações do banco de dados
* **08** - [ ] No TableManager criar método para efetuar count passando um findOptions sem select, relations, orderBy, roles.
* **19** = [ ] Desenvolver o procedimento de roolback das migrations.
* **20** - [ ] Passar por todo o ORM validando e adicionando os comentários nos métodos
* **23** - [ ] Estudar uma forma de gerar as triggers, procedures e views pelo ORM

## Find

* **22** - [ ] Ver para criar "rules" a nivel de linha, neste caso o cara pode adiconar um SQL ou uma condição JavaScript, permissões.
* **99** - [ ] Carregar as relações com base na necessidade das condiçoes e ordenação.
   - No TableManager.find adicionar as relações automáticamente
   - No QueryBuild validar se falta alguma relação para o caso do cliente montar a query manualmente 

## Save

* **21** - [ ] Criar um saveOptions, aonde o cara poderá adicionar os eventos: beforeSave, afterSave, beforeLoadPrimaryKey, afterLoadPrimaryKey especificos para uma função

## Cli

* **05** - [ok] Comandos: migrations(generate,create,run)
* **06** - [ok] Gerar as migrations em arquivos
- 