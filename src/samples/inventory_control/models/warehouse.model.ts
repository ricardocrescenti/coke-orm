import { Column, Table, OneToMany, Unique, Index, AfterInsert } from "../../../decorators";
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

   @AfterInsert()
   aftetInsert() {
      console.log('after insert');
   }

}
