import { Map } from "../common/interfaces/map";
import { PostgresDriver } from "../drivers/postgres/postgres-driver";
import { TableSchema } from "./table-schema";

/**
 * 
 */
export abstract class Schema {
   public readonly tables: Map<TableSchema> = {};

   /**
    * 
    */
   protected readonly driver: PostgresDriver;

   constructor(driver: PostgresDriver) {
      this.driver = driver;
   }

   /**
    * 
    */
   public abstract load(): Promise<void>;
}