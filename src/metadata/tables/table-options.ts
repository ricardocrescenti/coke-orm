import { StringUtils } from "../../utils/string-utils";

export class TableOptions {
   /**
    * Metadata name, used to group database models.
    */
   public readonly metadata?: string;
   /**
    * Table name.
    * If not specified then naming strategy will generate table name from entity name.
    */
   public readonly name?: string;
   /**
    * Specifies a default order by used for queries from this table when no explicit order by is specified.
    */
   public readonly orderBy?: any;

   constructor(target: any, options?: TableOptions) {
      this.metadata = options?.metadata ?? 'default';
      this.name = options?.name ?? StringUtils.snakeCase(target.name);
      this.orderBy = options?.orderBy;
   }
}