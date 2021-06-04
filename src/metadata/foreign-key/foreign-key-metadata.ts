import { ColumnMetadata } from "../column";
import { EntityMetadata } from "../entity";
import { ForeignKeyOptions } from "./foreign-key-options";

export class ForeignKeyMetadata extends ForeignKeyOptions {

   /**
    * 
    */
   public readonly entity: EntityMetadata;

   /**
    * 
    */
   public readonly column: ColumnMetadata;

   /**
    * 
    */
   public get canInsert(): boolean {
       return (this.cascade?.indexOf('insert') ?? -1) >= 0;
   }

   /**
    * 
    */
   public get canUpdate(): boolean {
       return (this.cascade?.indexOf('update') ?? -1) >= 0;
   }

   /**
    * 
    */
   public get canRemove(): boolean {
       return (this.cascade?.indexOf('remove') ?? -1) >= 0;
   }

   /**
    * 
    */
   public get referencedEntityManager() {
      return this.entity.connection.getEntityManager(this.referencedEntity);
   }

   constructor(options: ForeignKeyMetadata) {
      super(options);
      this.entity = options.entity;
      this.column = options.column;
      
      this.column.foreignKeys.push(this);
   }

   public getReferencedEntityMetadata(): EntityMetadata {
      return this.entity.connection.entities[this.referencedEntity];
   }

   public getReferencedColumnMetadata(): ColumnMetadata {
      return this.getReferencedEntityMetadata().getColumn(this.referencedColumn);
   }

}