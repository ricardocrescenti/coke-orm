import { Metadata } from "../../metadata/metadata";
import { WarehouseModel } from "./models/warehouse.model";
import { ProductModel } from "./models/product.model";
import { MetadataUtils } from "../../utils/metadata-utils";
import { CokeORM } from "../../coke-orm";
import { DatabaseDriver } from "../../drivers/driver-type";

console.log('1 - Creating Models');

const warehouse = new WarehouseModel();
const product = new ProductModel();

console.log('2 - Metadata');

//const tables = Metadata.get().getTables();
//console.log('Metadata.tables', JSON.stringify(tables));

console.log('3 - Conecting');

CokeORM.connect({
   driver: DatabaseDriver.Postgres,
   host: 'localhost',
   port: 2815,
   user: 'cokeorm',
   password: 'cokeorm',
   database: 'cokeorm'
}).then((connection) => {

   console.log('4 - Connected');

}).catch((error) => {

   console.log('4 - ', error);
   
})