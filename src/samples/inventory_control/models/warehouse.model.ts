import { Column, Model } from "../../../decorators";
import { PatterModel } from "./pattern.model";

@Model({ name: 'warehouses' })
export class WarehouseModel extends PatterModel {

   @Column()
   public name?: string = 'Sem nome';

   @Column()
   public isDefault?: boolean;

   constructor() {
      super();
   }

}
