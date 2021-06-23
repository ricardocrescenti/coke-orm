import { CokeORM } from "../coke-orm";
import { Connection } from "../connection";
import { Status } from "./enums/status.enum";
import { CategoryModel } from "./models/categories/category.model";
import { CityModel } from "./models/entity/city.model";
import { EntityAddressModel } from "./models/entity/entity-address.model";
import { SellerModel } from "./models/entity/seller.model";

export async function test() {
  
   const connection: Connection = await CokeORM.connect();

   let category: CategoryModel;
   let categories: any;

   category = await connection.getEntityManager(CategoryModel).save({
      name: 'Category 1'
   });
   
   categories = await connection.getEntityManager(CategoryModel).save([
      {
         name: 'Category 2'
      },
      {
         name: 'Category 1.1',
         parent: category
      }
   ]);

   categories = await await connection.getEntityManager(CategoryModel).find({
      where: [
         {
            parent: { isNull: true },
         },
         {
            parent: {
               id: 2
            }
         }
      ],
      relations: [
         'parent'
      ]
   })

   let city: CityModel;

   city = await connection.getEntityManager(CityModel).save({
      name: 'Guaporé 99',
      code: '4309499',
      state: 'RS',
      country: 'BRA'
   });
   await city.delete({ queryRunner: connection.queryRunner });

   city = await connection.getEntityManager(CityModel).findOne({
      where: { id: 1 }
   });

   city = await connection.getEntityManager(CityModel).create({
      name: 'Guaporé',
      code: '4309407',
      state: 'RS',
      country: 'BRA'
   });

   await city.loadPrimaryKey(connection.queryRunner);
   console.log('loadPrimaryKey', city);

   const cities = await connection.getEntityManager(CityModel).find({
      where: [
         {
            name: { equal: 'Guaporé' },
            AND: [
               { 
                  code: { between: ['4309406', '4309407'] },
                  state: { equal: 'RS' }
               }
            ]
         },
         {
            name: { equal: 'Serafina' },
            AND: [
               { code: { between: ['4309400', '4309402'] } },
               { state: { equal: 'SC' } }
            ]
         },
         // {
         //    RAW: {
         //       condition: 'id = :teste',
         //       params: {
         //          teste: 1
         //       }
         //    }
         // }
      ]
   });
   console.log('find', cities);
   
   city = await connection.getEntityManager(CityModel).create({
      name: 'Guaporé',
      code: '4309407',
      state: 'RS',
      country: 'BRA'
   });
   await city.save({ queryRunner: connection.queryRunner });

   city = await connection.getEntityManager(CityModel).create({
      name: 'Guaporé 2',
      code: '4309408',
      state: 'RS',
      country: 'BRA'
   });
   await city.save({ queryRunner: connection.queryRunner });

   city = await connection.getEntityManager(CityModel).create({
      name: 'Guaporé 3',
      code: '4309408',
      state: 'RS',
      country: 'BRA'
   });
   await city.save({ queryRunner: connection.queryRunner });
   await city.delete({ queryRunner: connection.queryRunner });

   const sellerEntityManager = connection.getEntityManager(SellerModel);
   let seller: SellerModel = sellerEntityManager.create({
      uuid: '1fecca37-3d8c-4ff7-8df6-cf7b496b6bcb',
      entity: {
         name: 'Ana Luiza Crescenti',
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
      status: Status.active
   });
   await seller.save({ queryRunner: connection.queryRunner });
   seller = sellerEntityManager.create({
      uuid: '1fecca37-3d8c-4ff7-8df6-cf7b496b6bcb',
      entity: {
         name: 'Ana Luiza Crescenti',
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
            },
            {
               contact: 'Ricardo',
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
   await seller.save({ queryRunner: connection.queryRunner });
   await sellerEntityManager.save(seller);

   seller.entity?.addresses?.push(connection.getEntityManager(EntityAddressModel).create({
      contact: 'Ricardo',
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
   }));
   seller.entity?.addresses?.push(connection.getEntityManager(EntityAddressModel).create({
      contact: 'Dani',
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
   }));

   await seller.save({ queryRunner: connection.queryRunner });
   seller.entity?.addresses?.splice(1, 1);
   seller.entity?.addresses?.splice(1, 1);
   seller.status = Status.inactive;
   await seller.save({ queryRunner: connection.queryRunner });
  
   const sellers = await connection.getEntityManager(SellerModel).find({
      select: [
         'id',
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
               'city',
               'isDefault'
            ]],
            'photo'
         ]],
         'status'
      ],
      relations: [
         'entity',
         'entity.addresses',
         'entity.addresses.city',
         'entity.phones',
         'entity.photo'
      ],
      where: [
         {
            entity: {
               name: 'Ana Luiza Crescenti',
               photo: {
                  privateUrl: { isNull: true }
               },
               addresses: {
                  isDefault: true,
                  city: {
                     code: '4309407'
                  }
               } as any
            }
         },
         {
            entity: {
               name: 'Ana Luiza Crescenti',
               photo: {
                  privateUrl: { isNull: true }
               },
               addresses: {
                  isDefault: false,
                  city: {
                     code: '4309407'
                  }
               } as any
            }
         },
         {
            id: 6
         },
         {
            id: {
               greaterThanOrEqual: 0,
               lessThanOrEqual: 50
            }
         }
      ],
      // childWhere: {
      //    entity: {
      //       addresses: {
      //          isDefault: true
      //       } as any
      //    }
      // },
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