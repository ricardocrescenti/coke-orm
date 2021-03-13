import { WarehouseModel } from "./models/warehouse.model";
//import { ProductModel } from "./models/product.model";
import { CokeORM } from "../../coke-orm";
import { DatabaseDriver } from "../../common/enum/driver-type";
import { Connection } from "../../connection/connection";
import { DecoratorSchema } from "../../decorators/decorators-schema";
import { ProductModel } from "./models/product.model";

export async function test() {

   console.log('1 - Creating Models');

   //const warehouse = new WarehouseModel();
   //const product = new ProductModel();

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
      port: 5432,
      user: 'devmaster',
      password: 'supadm',
      database: 'devmaster',
      tables: [
         WarehouseModel,
         ProductModel
      ],
      synchronize: true
   });

   console.log('4 - Connected', JSON.stringify(DecoratorSchema.getTables()));
   console.log('5 - Connected', connection);

}

test().catch((error) => {
   console.log('4 - ', error);
})