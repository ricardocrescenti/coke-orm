import { SubscriberAlreadyInformedError } from "../errors";
import { EntityOptions, ColumnOptions, IndexOptions, UniqueOptions } from "../metadata";
import { SubscriberOptions } from "./event/subscriber-options";

export class DecoratorsStore {
   private static entities: EntityOptions[] = [];
   private static columns: ColumnOptions[] = [];
   private static events: SubscriberOptions[] = [];
   private static uniques: UniqueOptions[] = [];
   private static indexs: IndexOptions[] = [];

   private constructor() {}

   public static addEntity(entity: EntityOptions): void {
      this.entities.push(entity);
   }
   public static getEntity(requestedEntity: Function | string): EntityOptions | null {
      const selectedEntities: EntityOptions[] = this.entities.filter((entity) => {
         return entity.target.constructor == requestedEntity;
      });
      return (selectedEntities.length > 0 ? selectedEntities[0] : null);
   }
   public static getEntities(requestedEntities?: Function[]): EntityOptions[] {
      return Object.values(this.entities).filter((entity) => !requestedEntities || requestedEntities.indexOf(entity.target) >= 0);
   }

   public static addColumn(column: ColumnOptions): void {
      DecoratorsStore.columns.push(column);
   }
   public static getColumn(targets: Function[], columnProperyName: string): ColumnOptions | undefined {
      return DecoratorsStore.columns.find((column) => targets.indexOf(column.target.constructor) >= 0 && column.propertyName == columnProperyName);
   }
   public static getColumns(targets: Function[]): ColumnOptions[] {
      return DecoratorsStore.columns.filter((column) => targets.indexOf(column.target.constructor) >= 0);
   }

   public static addSubscriber(subscriber: SubscriberOptions): void {
      const currentSubscriber = this.getSubscriber(subscriber.target);
      if (currentSubscriber) {
         throw new SubscriberAlreadyInformedError(subscriber);
      }

      DecoratorsStore.events.push(subscriber);
   }
   public static getSubscriber(target: Function): SubscriberOptions | undefined {     
      const [event] = DecoratorsStore.events.filter((event) => target == event.target);
      return event;
   }

   public static addUnique(unique: UniqueOptions): void {
      DecoratorsStore.uniques.push(unique);
   }
   public static getUniques(targets: Function[]): UniqueOptions[] {
      return DecoratorsStore.uniques.filter((unique) => targets.indexOf(unique.target) >= 0);
   }

   public static addIndex(index: IndexOptions): void {
      DecoratorsStore.indexs.push(index);
   }
   public static getIndexs(targets: Function[]): IndexOptions[] {
      return DecoratorsStore.indexs.filter((index) => targets.indexOf(index.target) >= 0);
   }

}