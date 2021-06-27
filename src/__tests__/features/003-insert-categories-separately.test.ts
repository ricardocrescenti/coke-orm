import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from './config/connection.options';
import { CategoryEntity } from './models/category.entity';

describe('003 - Insert categories separately', () => {
	let connection: Connection;

	beforeAll(async () => {
		connectionOptions.entities?.push(CategoryEntity);
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert categories separately', async () => {
		let category;

		category = await connection.getEntityManager(CategoryEntity).save({
			name: 'Category 1',
		});
		expect(category.id).toEqual('1');

		category = await connection.getEntityManager(CategoryEntity).save({
			name: 'Category 2',
		});
		expect(category.id).toEqual('2');

		category = await connection.getEntityManager(CategoryEntity).save({
			name: 'Category 3',
		});
		expect(category.id).toEqual('3');

		category = await connection.getEntityManager(CategoryEntity).save({
			name: 'Category 4',
		});
		expect(category.id).toEqual('4');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, name
			FROM categories
			ORDER BY id`);

		expect(query.length).toEqual(4);
		for (let i = 0; i < query.length; i++) {
			expect(query[i].id).toEqual((i + 1).toString());
			expect(query[i].name).toEqual('Category ' + (i + 1).toString());
		}

	});

});

