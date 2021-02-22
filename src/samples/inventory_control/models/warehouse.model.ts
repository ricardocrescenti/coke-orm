import { Column, Table, OneToMany } from "../../../decorators";
import { PatterModel } from "./pattern.model";
import { ProductModel } from "./product.model";

@Table({ name: 'warehouses' })
export class WarehouseModel extends PatterModel {

   @Column()
   public name?: string = 'Sem nome';

   @Column()
   public isDefault?: boolean;

   @OneToMany({ relation: { target: WarehouseModel, targetColumnName: 'id', cascade: ['insert', 'update'] } })
   public products?: Array<ProductModel>;

   constructor() {
      super();
   }

}
