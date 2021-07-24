/* eslint-disable require-jsdoc */
import { CokeORM } from '../coke-orm';
import { Connection } from '../connection';
import { ProductModel } from '../__tests__/models/product.model';
import { Status } from './enums/status.enum';
import { CityModel } from './models/entity/city.model';
import { EntityAddressModel } from './models/entity/entity-address.model';
import { SellerModel } from './models/entity/seller.model';

export async function test() {

	// Connect to database
	const connection: Connection = await CokeORM.connect();

	// Clean up the database to start testing
	// await connection.queryRunner.query(`
	// 	DELETE FROM carriers;
	// 	DELETE FROM categories;
	// 	DELETE FROM collaborators;
	// 	DELETE FROM companies;
	// 	DELETE FROM customers;
	// 	DELETE FROM sellers;
	// 	DELETE FROM entities_addresses;
	// 	DELETE FROM entities_documents;
	// 	DELETE FROM entities_phones;
	// 	DELETE FROM entities;
	// 	DELETE FROM prices_lists;
	// 	DELETE FROM cities;
	// 	DELETE FROM files;`);

	let product = await connection.getEntityManager(ProductModel).save({
		name: 'Product With Image Debug 1',
		image: {
			privateUrl: 'privateurl/image1.jpg',
		},
	});
	console.log(product);

	product = await connection.getEntityManager(ProductModel).create({
		name: 'Product With Image Debug 2',
		image: {
			privateUrl: 'privateurl/image2.jpg',
		},
	});
	await product.save({ queryRunner: connection.queryRunner });
	console.log(product);

	await insertCity(connection);

	let city: CityModel;

	city = await connection.getEntityManager(CityModel).save({
		name: 'Guaporé 99',
		code: '4309499',
		state: 'RS',
		country: 'BRA',
	});
	await city.delete({ queryRunner: connection.queryRunner });

	city = await connection.getEntityManager(CityModel).findOne({
		where: { id: 1 },
	});

	city = connection.getEntityManager(CityModel).create({
		name: 'Guaporé',
		code: '4309407',
		state: 'RS',
		country: 'BRA',
	});

	await city.loadPrimaryKey(connection.queryRunner);
	console.log('loadPrimaryKey', city);

	const cities = await connection.getEntityManager(CityModel).find({
		select: [
			'name',
		],
		where: [
			{
				name: { equal: 'Guaporé' },
				AND: [
					{
						code: { between: ['4309406', '4309407'] },
						state: { equal: 'RS' },
					},
				],
			},
			{
				name: { equal: 'Serafina' },
				AND: [
					{ code: { between: ['4309400', '4309402'] } },
					{ state: { equal: 'SC' } },
				],
			},
		],
		orderBy: {
			name: 'ASC',
		},
	} as any);
	console.log('find', cities);

	city = connection.getEntityManager(CityModel).create({
		name: 'Guaporé',
		code: '4309407',
		state: 'RS',
		country: 'BRA',
	});
	await city.save({ queryRunner: connection.queryRunner });

	city = connection.getEntityManager(CityModel).create({
		name: 'Guaporé 2',
		code: '4309408',
		state: 'RS',
		country: 'BRA',
	});
	await city.save({ queryRunner: connection.queryRunner });

	city = connection.getEntityManager(CityModel).create({
		name: 'Guaporé 3',
		code: '4309408',
		state: 'RS',
		country: 'BRA',
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
						country: 'BRA',
					},
				},
			],
			documents: [
				{
					document: '15975325896',
					type: 1,
				},
			],
			birthDate: '2012-09-24',
			gender: 2,
			phones: [
				{
					phoneNumber: '54999191676',
					type: 1,
				},
			],
			photo: {
				privateUrl: '/temp/sasdaskdakdslakdsal.jpg',
				publicUrl: '/temp/sasdaskdakdslakdsal.jpg',
			},
		},
		comission: 10,
		status: Status.active,
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
						country: 'BRA',
					},
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
						country: 'BRA',
					},
				},
			],
			documents: [
				{
					document: '15975325896',
					type: 1,
				},
			],
			birthDate: '2012-09-24',
			gender: 2,
			phones: [
				{
					phoneNumber: '54999191676',
					type: 1,
				},
			],
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
			country: 'BRA',
		},
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
			country: 'BRA',
		},
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
					'phoneNumber',
				]],
				['addresses', [
					'id',
					'description',
					'contact',
					'city',
					'isDefault',
				]],
				'photo',
			]],
			'status',
		],
		relations: [
			'entity',
			'entity.addresses',
			'entity.addresses.city',
			'entity.phones',
			'entity.photo',
		],
		where: [
			{
				entity: {
					name: 'Ana Luiza Crescenti',
					photo: {
						privateUrl: { isNull: true },
					},
					addresses: {
						isDefault: true,
						city: {
							code: '4309407',
						},
					} as any,
				},
			},
			{
				entity: {
					name: 'Ana Luiza Crescenti',
					photo: {
						privateUrl: { isNull: true },
					},
					addresses: {
						isDefault: false,
						city: {
							code: '4309407',
						},
					} as any,
				},
			},
			{
				id: 149,
			},
			{
				id: {
					greaterThanOrEqual: 0,
					lessThanOrEqual: 200,
				},
			},
		],
		// childWhere: {
		//    entity: {
		//       addresses: {
		//          isDefault: true
		//       } as any
		//    }
		// },
		roles: [
			'public',
		],
		orderBy: {
			entity: {
				name: 'ASC',
				phones: {
					contact: 'ASC',
					id: 'ASC',
				},
				photo: {
					privateUrl: 'ASC',
				},
				id: 'ASC',
			},
			id: 'ASC',
		},
	});
	console.log('find', sellers);

}

async function insertCity(connection: Connection) {

	await connection.getEntityManager(CityModel).create({
		name: 'Guaporé',
		code: '4309407',
		state: 'RS',
		country: 'BRA',
	});
	await connection.getEntityManager(CityModel).save({
		name: 'Guaporé 99',
		code: '4309499',
		state: 'RS',
		country: 'BRA',
	});

}

test().catch((error) => {
	console.error(error);
});
