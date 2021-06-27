/* eslint-disable require-jsdoc */
import { CokeORM } from '../coke-orm';
import { Connection } from '../connection';
import { Status } from './enums/status.enum';
import { CategoryModel } from './models/categories/category.model';
import { CityModel } from './models/entity/city.model';
import { EntityAddressModel } from './models/entity/entity-address.model';
import { SellerModel } from './models/entity/seller.model';

export async function test() {

	// Connect to database
	const connection: Connection = await CokeORM.connect();

	// Clean up the database to start testing
	await connection.queryRunner.query(`
		DELETE FROM carriers;
		DELETE FROM categories;
		DELETE FROM collaborators;
		DELETE FROM companies;
		DELETE FROM customers;
		DELETE FROM sellers;
		DELETE FROM entities_addresses;
		DELETE FROM entities_documents;
		DELETE FROM entities_phones;
		DELETE FROM entities;
		DELETE FROM prices_lists;
		DELETE FROM cities;
		DELETE FROM files;`);

	await insertCategories(connection);
	await insertCategoryChild(connection);
	await intertCategoriesWithChildren(connection);
	await deleteCategoryByDelete(connection);
	await deleteCategoryBySave(connection);
	await deleteCategoryChild(connection);
	await loadCategoryPrimaryKey(connection);
	await loadCategoryPrimaryKey(connection);

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
	});
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
				path: 'batatinha_path',
				content: 'teste',
				type: 0,
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
				id: 6,
			},
			{
				id: {
					greaterThanOrEqual: 0,
					lessThanOrEqual: 50,
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

async function insertCategories(connection: Connection) {

	await connection.getEntityManager(CategoryModel).save({
		name: 'Category 1',
	});
	await connection.getEntityManager(CategoryModel).save({
		name: 'Category 2',
	});
	await connection.getEntityManager(CategoryModel).save({
		name: 'Category 3',
	});
	await connection.getEntityManager(CategoryModel).save({
		name: 'Category 4',
	});

	const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).find();
	if (categories.length != 4) {
		throw new Error('insertCategories - Not all categories have been entered');
	}

}
async function insertCategoryChild(connection: Connection) {

	await connection.getEntityManager(CategoryModel).save({
		name: 'Category 4.1',
		parent: {
			name: 'Category 4',
		},
	});

	const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).find({
		relations: [
			'parent',
			'children',
		],
	});
	if (categories.length != 5) {
		throw new Error('insertCategoryChild - Not all categories have been entered');
	}

	if (categories[3].children?.length != 1) {
		throw new Error('insertCategoryChild - The category does not have a child category');
	}

	if (!categories[4].parent) {
		throw new Error('insertCategoryChild - Category has no parent category');
	}

}
async function intertCategoriesWithChildren(connection: Connection) {

	await connection.getEntityManager(CategoryModel).save({
		name: 'Category 5',
		children: [
			{
				name: 'Category 5.1',
			},
			{
				name: 'Category 5.2',
			},
		],
	});

	const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).find({
		relations: [
			'parent',
			'children',
		],
	});

	if (categories.length != 8) {
		throw new Error('intertCategoriesWithChildren - Not all categories have been entered');
	}

	if (categories[5].children?.length != 2) {
		throw new Error('intertCategoriesWithChildren - The category does not have a child category');
	}

}
async function deleteCategoryByDelete(connection: Connection) {

	await connection.getEntityManager(CategoryModel).delete({
		name: 'Category 1',
	});

	const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).find();

	if (categories.length != 7) {
		throw new Error('deleteCategoryByDelete - Not all categories have been deleted');
	}

}
async function deleteCategoryBySave(connection: Connection) {

	await connection.getEntityManager(CategoryModel).save({
		deleted: true,
		name: 'Category 2',
	});

	const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).find();

	if (categories.length != 6) {
		throw new Error('deleteCategoryBySave - Not all categories have been deleted');
	}

}
async function deleteCategoryChild(connection: Connection) {

	await connection.getEntityManager(CategoryModel).save({
		name: 'Category 5',
		children: [
			{
				name: 'Category 5.1',
			},
			{
				deleted: true,
				name: 'Category 5.2',
			},
		],
	});

	const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).find();

	if (categories.length != 5) {
		throw new Error('deleteCategoryChild - Not all categories have been deleted');
	}

}
async function loadCategoryPrimaryKey(connection: Connection) {

	const category = connection.getEntityManager(CategoryModel).create({
		name: 'Category 5',
		parent: {
			name: 'Category 4',
		},
		children: [
			{
				name: 'Category 5.1',
			},
			{
				name: 'Category 5.2',
			},
		],
	});
	await category.loadPrimaryKeyCascade(connection.queryRunner);

	if (!category.id) {
		throw new Error('loadCategoryPrimaryKey - The category did not load its id');
	}

	if (!category.parent?.id) {
		throw new Error(`loadCategoryPrimaryKey - Parent category '${category.parent?.name}' did not load its ID`);
	}

	if (category.children) {

		if (!category.children[0].id) {
			throw new Error(`loadCategoryPrimaryKey - Child category '${category.children[0].name}' did not load its ID`);
		}

		if (category.children[1].id) {
			throw new Error(`loadCategoryPrimaryKey - The child category '${category.children[1].name}' has loaded its ID but it should be reported`);
		}

	}

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
