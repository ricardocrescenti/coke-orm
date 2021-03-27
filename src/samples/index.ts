import { CokeORM } from "../coke-orm";
import { DatabaseDriver } from "../common/enum/driver-type";
import { Connection } from "../connection/connection";
import { DecoratorStore } from "../decorators/decorators-store";
import { CarrierModel } from "./models/entity/carrier.model";
import { CityModel } from "./models/entity/city.model";
import { CollaboratorModel } from "./models/entity/collaborator.model";
import { CompanyModel } from "./models/entity/company.model";
import { CustomerModel } from "./models/entity/customer.model";
import { EntityAddressModel } from "./models/entity/entity-address.model";
import { EntityDocumentModel } from "./models/entity/entity-document.model";
import { EntityPhoneModel } from "./models/entity/entity-phone.model";
import { EntityModel } from "./models/entity/entity.model";
import { SellerModel } from "./models/entity/seller.model";
import { FileModel } from "./models/file/file.model";
import { PriceListModel } from "./models/product/price-list.model";

export async function test() {

   //console.log('1 - Creating Models');

   //const warehouse = new WarehouseModel();
   //const product = new ProductModel();

   //console.log('2 - Metadata');

   //const tables = Metadata.get().getTables();
   //console.log('Metadata.tables', JSON.stringify(tables));

   console.log('3 - Conecting');
   console.time('CokeORM');

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
         CarrierModel,
         CityModel,
         CollaboratorModel,
         CompanyModel,
         CustomerModel,
         EntityAddressModel,
         EntityDocumentModel,
         EntityPhoneModel,
         EntityModel,
         SellerModel,
         FileModel,
         PriceListModel
      ],
      migrations: {
         synchronize: true
      }
   });

   console.log('4 - Connected', JSON.stringify(DecoratorStore.getTables()));
   console.log('5 - Connected', connection);
   console.timeEnd('CokeORM');

}

test().catch((error) => {
   console.log('4 - ', error);
})