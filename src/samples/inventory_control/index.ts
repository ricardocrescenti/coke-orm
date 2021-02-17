import { Metadata } from "../../metadata/metadata";
import { WarehouseModel } from "./models/warehouse.model";
import { ProductModel } from "./models/product.model";
import { CokeORM } from "../../coke-orm";
import { DatabaseDriver } from "../../common/enum/driver-type";
import { Connection } from "../../connection/connection";

export async function test() {

   console.log('1 - Creating Models');

   const warehouse = new WarehouseModel();
   const product = new ProductModel();

   console.log('2 - Metadata');

   //const tables = Metadata.get().getTables();
   //console.log('Metadata.tables', JSON.stringify(tables));

   console.log('3 - Conecting');

   const connection: Connection = await CokeORM.connect({
      // driver: DatabaseDriver.Postgres,
      // host: '34.122.198.83',
      // port: 9815,
      // user: 'admin',
      // password: 'd3v@Master*',
      // database: 'hant-dev'
      driver: DatabaseDriver.Postgres,
      host: 'localhost',
      port: 2815,
      user: 'cokeorm',
      password: 'cokeorm',
      database: 'cokeorm',
      models: [
         WarehouseModel
      ],
      synchronize: true
   });

   console.log('4 - Connected', JSON.stringify(Metadata.get()));

}

test().catch((error) => {
   console.log('4 - ', error);
})