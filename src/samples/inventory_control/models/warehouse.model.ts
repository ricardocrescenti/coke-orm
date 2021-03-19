import { Column, Table, OneToMany, Unique, Index, AfterInsert, AfterDelete, AfterUpdate, BeforeDelete, BeforeInsert, BeforeUpdate } from "../../../decorators";
import { PatterModel } from "./pattern.model";
import { ProductModel } from "./product.model";

@Table({ name: 'warehouses' })
@Unique({ columns: ['name'] })
@Index({ columns: ['name'], unique: true })
export class WarehouseModel extends PatterModel {

   @Column()
   public name?: string = 'Sem nome';

   @Column()
   public isDefault?: boolean;

   @OneToMany({ relation: { referencedTable: 'ProductModel', referencedColumnName: 'id', cascade: ['insert', 'update'] } })
   public products?: Array<ProductModel>;

   constructor() {
      super();
   }

   @BeforeInsert()
   public beforeInsert() {
      console.log('ProductModel', 'event', 'BeforeInsert');
   }

   @BeforeUpdate()
   public beforeUpdate() {
      console.log('ProductModel', 'event', 'BeforeUpdate');
   }

   @BeforeDelete()
   public beforeDelete() {
      console.log('ProductModel', 'event', 'BeforeDelete');
   }

   @AfterInsert()
   public afterInsert() {
      console.log('ProductModel', 'event', 'AfterInsert');
   }

   @AfterUpdate()
   public afterUpdate() {
      console.log('ProductModel', 'event', 'AfterUpdate');
   }

   @AfterDelete()
   public afterDelete() {
      console.log('ProductModel', 'event', 'AfterDelete');
   }

}
