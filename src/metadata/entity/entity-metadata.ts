import { ColumnMetadata } from "../column";
import { SimpleMap } from "../../common";
import { EntityOptions } from "./entity-options";
import { ForeignKeyMetadata } from "../foreign-key";
import { UniqueMetadata } from "../unique";
import { IndexMetadata } from "../index/index";
import { PrimaryKeyMetadata } from "../primary-key";
import { Connection } from "../../connection";
import { ColumnMetadataNotLocatedError } from "../../errors";
import { EntitySubscriberInterface } from "../event";
import { ConstructorTo } from "../../common";
import { TriggerMetadata } from "../trigger";

export class EntityMetadata extends EntityOptions {

   /**
    * 
    */
   public readonly connection: Connection;
   
   /**
    * 
    */
   public readonly columns: SimpleMap<ColumnMetadata> = new SimpleMap<ColumnMetadata>();
   
   /**
    * 
    */
   public readonly primaryKey?: PrimaryKeyMetadata;
   
   /**
    * 
    */
   public readonly foreignKeys: ForeignKeyMetadata[] = [];

   /**
    * 
    */
   public readonly uniques: UniqueMetadata[] = [];

   /**
    * 
    */
   public readonly indexs: IndexMetadata[] = [];

   /**
    * 
    */
   public readonly triggers: TriggerMetadata[] = [];

   /**
    * 
    */
   public readonly subscriber?: ConstructorTo<EntitySubscriberInterface<any>>;
   
   /**
    * 
    */
   private updatedAtColumn?: ColumnMetadata | null;

   /**
    * 
    */
   private deletedAtColumn?: ColumnMetadata | null;

   /**
    * 
    */
   private deletedIndicatorColumn?: ColumnMetadata | null;

   /**
    * 
    */
   private columnsThatCannotBeInserted?: ColumnMetadata[];

   /**
    * 
    */
   private columnsThatCannotBeUpdated?: ColumnMetadata[];

   /**
    * 
    * @param options 
    */
   constructor(options: Omit<EntityMetadata, 'manager' | 'columns' | 'primaryKey' | 'foreignKeys' | 'uniques' | 'indexs'  | 'triggers' | 'getColumn' | 'getUpdatedAtColumn' | 'getDeletedAtColumn' | 'getDeletedIndicatorColumn' | 'getColumnsThatCannotBeInserted' | 'getColumnsThatCannotBeUpdated'>) {
      super(options);
      this.connection = options.connection;
      this.subscriber = options.subscriber;
   }

   /**
    * 
    * @param columnName 
    * @returns 
    */
   public getColumn(columnName: string) : ColumnMetadata {
      const column = this.columns[columnName];
      if (!column) {
         throw new ColumnMetadataNotLocatedError(this.className, columnName);
      }
      return column;
   }

   /**
    * 
    * @returns 
    */
   public getUpdatedAtColumn(): ColumnMetadata | null {
      if (this.updatedAtColumn === undefined) {
         this.updatedAtColumn = Object.values(this.columns).find(columnMetadata => columnMetadata.operation == 'UpdatedAt') ?? null;
      }
      return this.updatedAtColumn;
   }

   /**
    * 
    * @returns 
    */
   public getDeletedAtColumn(): ColumnMetadata | null {
      if (this.deletedAtColumn === undefined) {
         this.deletedAtColumn = Object.values(this.columns).find(columnMetadata => columnMetadata.operation == 'DeletedAt') ?? null;
      }
      return this.deletedAtColumn;
   }

   /**
    * 
    */
   public getDeletedIndicatorColumn(): ColumnMetadata | null {
      if (this.deletedIndicatorColumn === undefined) {
         this.deletedIndicatorColumn = Object.values(this.columns).find(columnMetadata => columnMetadata.operation == 'DeletedIndicator') ?? null;
      }
      return this.deletedIndicatorColumn;
   }

   /**
    * 
    * @returns 
    */
   public getColumnsThatCannotBeInserted(): ColumnMetadata[] {
      if (this.columnsThatCannotBeInserted === undefined) {
         this.columnsThatCannotBeInserted = Object.values(this.columns).filter(columnMetadata => !columnMetadata.canInsert);
      }
      return this.columnsThatCannotBeInserted as ColumnMetadata[];
   }

   /**
    * 
    * @returns 
    */
   public getColumnsThatCannotBeUpdated(): ColumnMetadata[] {
      if (this.columnsThatCannotBeUpdated === undefined) {
         this.columnsThatCannotBeUpdated = Object.values(this.columns).filter(columnMetadata => !columnMetadata.canUpdate);
      }
      return this.columnsThatCannotBeUpdated as ColumnMetadata[];
   }

}