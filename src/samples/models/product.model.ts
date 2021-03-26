import { AfterDelete, AfterInsert, AfterUpdate, BeforeDelete, BeforeInsert, BeforeUpdate, Column, Index, ManyToOne, Table, Unique } from "../../decorators";
import { PatterModel } from "./pattern.model";
import { WarehouseModel } from "./warehouse.model";

@Table({ name: 'products' })
@Unique({ columns: ['reference'] })
@Index({ columns: ['reference'] })
export class ProductModel extends PatterModel {

   @Column({ nullable: false })
   public reference?: string;

   @Column({ nullable: false })
   public name?: string;

   @ManyToOne({ nullable: false, relation: { referencedTable: 'WarehouseModel', referencedColumnName: 'id', cascade: false, onUpdate: 'CASCADE', onDelete: 'RESTRICT' } })
   public warehouse?: WarehouseModel;

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