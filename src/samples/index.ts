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

   console.log('Connecting', new Date().toLocaleString());

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

   console.log('Connected', new Date().toLocaleString());

   // const cities = await connection.createSelectQuery<CustomerModel>()
   //    .select({ column: 'id' })
   //    .from('cities')
   //    .where([
   //       {
   //          id: { _eq: -1 }
   //       },
   //       {
   //          id: { _eq: 0 },
   //          _or: [
   //             { id: { _eq: 1 } },
   //             { id: { _eq: 2 } },
   //             { id: { _eq: 3 } }
   //          ]
   //       },
   //       {
   //          _or: [
   //             { id: { _eq: 4 } },
   //             { id: { _eq: 5 } },
   //             { id: { _eq: 6 } }
   //          ]
   //       }
   //    ])

   const entity = await connection.createTableManager(EntityModel).find({
      // select: [
      //    'id',
      //    'name',
      //    ['addresses', [
      //       'id', 
      //       'description', 
      //       'contact',
      //       ['city', [
      //          'id',
      //          'name'
      //       ]]
      //    ]],
      //    'photo'
      // ],
      relations: [
         'addresses',
         'addresses.city',
         'photo'
      ],
      // where: {
      //    name: { _eq: 'Ricardo Crescenti' }
      // }
   });
   console.log('find', entity);

   const guapore: CityModel = new CityModel({
      code: '4309407',
      name: 'Guaporé',
      state: 'RS',
      country: 'BRA'
   });
   await guapore.save(connection);
   console.log('save', guapore);

   const portoAlegre = await connection.createTableManager(CityModel).save({
      code: '4309408',
      name: 'Porto Alegre',
      state: 'RS',
      country: 'BRA'
   });
   console.log(portoAlegre);

}

test().catch((error) => {
   console.error(error);
})