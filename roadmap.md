# CokeORM

## Geral

* Ajustar o uso do campo com operador 'DeletedIndicator' para não criar campo e detectar eles ao salvar para deletar
* Testar o uso da option 'enum' das colunas
* Adicionado a opção 'nullable' no OneToMany
* Verificar no connection.entities se fica o nome da tabela ou do model
* Melhor o método save, ficar o processo principal no EntityManager

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
