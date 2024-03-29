import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';

describe('Insert categories in batch', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert categories in batch', async () => {

		const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).save([
			{
				name: 'Category 5',
			},
			{
				name: 'Category 6',
			},
			{
				name: 'Category 7',
			},
			{
				name: 'Category 8',
			},
		]);

		expect(categories.length).toBe(4);
		expect(categories[0].id?.toString()).toEqual('5');
		expect(categories[1].id?.toString()).toEqual('6');
		expect(categories[2].id?.toString()).toEqual('7');
		expect(categories[3].id?.toString()).toEqual('8');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, name
			FROM categories
			ORDER BY id`);

		expect(query.length).toEqual(8);
		for (let i = 4; i < query.length; i++) {
			expect(query[i].id?.toString()).toEqual((i + 1).toString());
			expect(query[i].name).toEqual('Category ' + (i + 1).toString());
		}

	});

});

