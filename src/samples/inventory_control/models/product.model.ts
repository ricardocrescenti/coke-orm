import { BeforeInsert, Column, ManyToOne, Table } from "../../../decorators";
import { PatterModel } from "./pattern.model";
import { WarehouseModel } from "./warehouse.model";

@Table({ name: 'products' })
export class ProductModel extends PatterModel {

   @Column()
   public name?: string;

   @ManyToOne({ name: 'warehouse_id', relation: { target: 'WarehouseModel', targetColumnName: 'id', cascade: false } })
   public warehouse?: WarehouseModel;

   @BeforeInsert()
   public beforeInsert() {
      console.log('beforeInsert called');
   }
}