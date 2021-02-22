import { Connection } from "../connection/connection";
import { AlterColumnQueryBuilder } from "./alter-column";
import { CreateColumnQueryBuilder } from "./create-column";
import { CreateForeignKeyQueryBuilder } from "./create-foreign-key";
import { CreateIndexQueryBuilder } from "./create-index";
import { CreateTableQueryBuilder } from "./create-table";
import { DeleteColumnQueryBuilder } from "./delete-column";
import { DeleteForeignKeyQueryBuilder } from "./delete-foreign-key";
import { DeleteIndexQueryBuilder } from "./delete-index";
import { DeleteTableQueryBuilder } from "./delete-table";
import { DeleteUniqueQueryBuilder } from "./delete-unique";

export class QueryBuilder {

   public readonly connection: Connection;

   constructor(connection: Connection) {
      this.connection = connection;
   }

   public alterColumn() : AlterColumnQueryBuilder {
      return new AlterColumnQueryBuilder(this.connection);
   }

   public createColumn() : CreateColumnQueryBuilder {
      return new CreateColumnQueryBuilder(this.connection);
   }

   public createForeignKey() : CreateForeignKeyQueryBuilder {
      return new CreateForeignKeyQueryBuilder(this.connection);
   }

   public createIndex() : CreateIndexQueryBuilder {
      return new CreateIndexQueryBuilder(this.connection);
   }

   public createTable() : CreateTableQueryBuilder {
      return new CreateTableQueryBuilder(this.connection);
   }

   public createUnique() : CreateIndexQueryBuilder {
      return new CreateIndexQueryBuilder(this.connection);
   }

   public deleteColumn() : DeleteColumnQueryBuilder {
      return new DeleteColumnQueryBuilder(this.connection);
   }

   public deleteForeignKey() : DeleteForeignKeyQueryBuilder {
      return new DeleteForeignKeyQueryBuilder(this.connection);
   }

   public deleteIndex() : DeleteIndexQueryBuilder {
      return new DeleteIndexQueryBuilder(this.connection);
   }

   public deleteTable() : DeleteTableQueryBuilder {
      return new DeleteTableQueryBuilder(this.connection);
   }

   public deleteUnique() : DeleteUniqueQueryBuilder {
      return new DeleteUniqueQueryBuilder(this.connection);
   }
}