import { QueryOrder } from "../../query-builder/types/query-order";
import { MetadataUtils } from "../../utils/metadata-utils";

export class TableOptions<T = any> {
   
   /**
    * Class referenced to this table.
    */
   public readonly target: any;

   /**
    * 
    */
   public readonly inheritances: Function[];


   public readonly className: string;
   
   /**
    * Table name.
    * If not specified then naming strategy will generate table name from entity name.
    */
   public readonly name?: string;
   
   /**
    * Specifies a default order by used for queries from this table when no explicit order by is specified.
    */
   public readonly orderBy?: QueryOrder<T>;

   constructor(options: Omit<TableOptions, 'inheritances'>) {
      this.target = options.target;
      this.inheritances = MetadataUtils.getInheritanceTree(options.target).reverse();
      this.className = options.target.name;
      this.name = options.name;
      this.orderBy = options.orderBy;
   }

}