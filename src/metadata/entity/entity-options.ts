import { ConstructorTo } from "../../common";
import { QueryOrder } from "../../query-builder";
import { MetadataUtils } from "../../utils";

export class EntityOptions<T = any> {
   
   /**
    * Class referenced to this entity.
    */
   public readonly target: ConstructorTo<any>;

   /**
    * 
    */
   public readonly inheritances: Function[];


   public readonly className: string;
   
   /**
    * Entity name.
    * If not specified then naming strategy will generate entity name from entity name.
    */
   public readonly name?: string;
   
   /**
    * Specifies a default order by used for queries from this entity when no explicit order by is specified.
    */
   public readonly orderBy?: QueryOrder<T>;

   /**
    * 
    */
   public readonly customOptions?: any;

   constructor(options: Omit<EntityOptions, 'inheritances'>) {
      this.target = options.target;
      this.inheritances = MetadataUtils.getInheritanceTree(options.target).reverse();
      this.className = options.target.name;
      this.name = options.name;
      this.orderBy = options.orderBy;
      this.customOptions = options.customOptions;
   }

}