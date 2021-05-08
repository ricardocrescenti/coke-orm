import { CokeORM } from "../coke-orm";
import { DatabaseDriver } from "../common/enum/driver-type";
import { Connection } from "../connection/connection";
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

   let city: CityModel;

   // city = await connection.findOne(CityModel, {
   //    where: { id: 1 }
   // });

   // city = await connection.getTableManager(CityModel).create({
   //    name: 'Guaporé',
   //    code: '4309407',
   //    state: 'RS',
   //    country: 'BRA'
   // });

   // await city.loadPrimaryKey(connection);
   // console.log('loadPrimaryKey', city);

   // const cities = await connection.find(CityModel, {
   //    where: [
   //       {
   //          name: { equal: 'Guaporé' },
   //          AND: [
   //             { 
   //                code: { between: ['4309406', '4309407'] },
   //                state: { equal: 'RS' }
   //             }
   //          ]
   //       },
   //       {
   //          name: { equal: 'Serafina' },
   //          AND: [
   //             { code: { between: ['4309400', '4309402'] } },
   //             { state: { equal: 'SC' } }
   //          ]
   //       },
   //       {
   //          RAW: {
   //             condition: 'id = :teste',
   //             params: {
   //                teste: 1
   //             }
   //          }
   //       }
   //    ]
   // });
   // console.log('find', cities);
   
   // city = await connection.getTableManager(CityModel).create({
   //    name: 'Guaporé',
   //    code: '4309407',
   //    state: 'RS',
   //    country: 'BRA'
   // });
   // await city.save(connection);

   // city = await connection.getTableManager(CityModel).create({
   //    name: 'Guaporé 2',
   //    code: '4309408',
   //    state: 'RS',
   //    country: 'BRA'
   // });
   // await city.save(connection);

   // city = await connection.getTableManager(CityModel).create({
   //    name: 'Guaporé 3',
   //    code: '4309408',
   //    state: 'RS',
   //    country: 'BRA'
   // });
   // await city.save(connection);
   // await city.delete(connection);

   const sellerTableManager = connection.getTableManager(SellerModel);
   let seller: SellerModel = sellerTableManager.create({
      uuid: '1fecca37-3d8c-4ff7-8df6-cf7b496b6bcb',
      entity: {
         name: 'Ana Luis Crescenti',
         displayName: 'Ana',
         email: 'analuiza.crescenti@gmail.com',
         addresses: [
            {
               contact: 'Ana',
               street: 'Rua Rodrigues Alves',
               number: '590',
               complement: 'Casa',
               neighborhood: 'Conteição',
               zipCode: '99200000',
               city: {
                  code: '4309407',
                  state: 'RS',
                  country: 'BRA'
               }
            }
         ],
         documents: [
            {
               document: '15975325896',
               type: 1
            }
         ],
         birthDate: '2012-09-24',
         gender: 2,
         phones: [
            {
               phoneNumber: '54999191676',
               type: 1
            }
         ]
      },
      comission: 10,
   });
   await seller.save(connection);
   seller = sellerTableManager.create({
      uuid: '1fecca37-3d8c-4ff7-8df6-cf7b496b6bcb',
      entity: {
         name: 'Ana Luis Crescenti',
         displayName: 'Ana',
         email: 'analuiza.crescenti@gmail.com',
         addresses: [
            {
               contact: 'Ana',
               street: 'Rua Rodrigues Alves',
               number: '590',
               complement: 'Casa',
               neighborhood: 'Conteição',
               zipCode: '99200000',
               city: {
                  code: '4309407',
                  state: 'RS',
                  country: 'BRA'
               }
            }
         ],
         documents: [
            {
               document: '15975325896',
               type: 1
            }
         ],
         birthDate: '2012-09-24',
         gender: 2,
         phones: [
            {
               phoneNumber: '54999191676',
               type: 1
            }
         ]
      },
      comission: 10,
   });
   await seller.save(connection);
   // await sellerTableManager.save(seller);

   /**
    * 
    * * Geral
    * 04 - No TableManager criar método para efetuar count passando um findOptions sem select, relations, orderBy, roles.
    * 02 - Nas relaçòes com filhos quando salvar, se não mandar um objeto que tinha antes, deletar ele, se tiver cascade['delete']
    * 03 - Permitir inicializar o CokeORM a partir de um arquivo de configuração
    * 05 - Criar a tabela "migrations" para gerenciar as migrações do banco de dados
    * 23 - Estudar uma forma de gerar as triggers, procedures e views pelo ORM
    * 09 - Passar por todo o ORM validando e adicionando os comentários nos métodos
    * 
    * * Find
    * 01 - Carregar as relações com base na necessidade das condiçoes e ordenação.
    *      - No TableManager.find adicionar as relações automáticamente
    *      - No QueryBuild validar se falta alguma relação para o caso do cliente montar a query manualmente 
    * 22 - Ver para criar "rules" a nivel de linha, neste caso o cara pode adiconar um SQL ou uma condição JavaScript, permissões.
    * 
    * * Save
    * 21 - Criar um saveOptions, aonde o cara poderá adicionar os eventos: beforeSave, afterSave, beforeLoadPrimaryKey, afterLoadPrimaryKey especificos para uma função
    * 
    * * Cli
    * 06 - Comandos: migrations(generate,create)
    * 08 - Carregar as classes de pastas
    * 07 - Gerar as migrAtions em arquivos
    * - 
    * 
    */

   const sellers = await connection.find(SellerModel, {
      select: [
         ['entity', [
            'id',
            'name',
            ['phones', [
               'id', 
               'type', 
               'phoneNumber'
            ]],
            ['addresses', [
               'id', 
               'description', 
               'contact',
               'city'
            ]],
            'photo'
         ]]
      ],
      relations: [
         'entity',
         'entity.addresses',
         'entity.addresses.city',
         'entity.phones',
         'entity.photo'
      ],
      where: {
         entity: {
            photo: {
               privateUrl: 'Ricardo Crescenti'
            },
            addresses: {
               isDefault: true
            } as any
         }
      },
      roles: [
         'public'
      ],
      orderBy: {
         entity: {
            name: 'ASC',
            phones: {
               contact: 'ASC',
               id: 'ASC'
            },
            photo: {
               privateUrl: 'ASC'
            },
            id: 'ASC'
         },
         id: 'ASC'
      }
   });
   console.log('find', sellers);

}

test().catch((error) => {
   console.error(error);
})