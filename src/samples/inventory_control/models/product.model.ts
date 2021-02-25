import { BeforeInsert, Column, ManyToOne, Table } from "../../../decorators";
import { PatterModel } from "./pattern.model";
import { WarehouseModel } from "./warehouse.model";

@Table({ 
   name: 'products',
   uniques: [ 
      { columns: ['reference'] } 
   ],
   indexs: [
      { columns: ['reference'] }
   ]
})
export class ProductModel extends PatterModel {

   @Column()
   public reference?: string;

   @Column()
   public name?: string;

   @ManyToOne({ relation: { referencedTable: 'WarehouseModel', referencedColumnName: 'id', cascade: false } })
   public warehouse?: WarehouseModel;

   @BeforeInsert()
   public beforeInsert() {
      console.log('beforeInsert called');
   }
}