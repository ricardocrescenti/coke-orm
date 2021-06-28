import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { CategoryModel } from '../../samples/models/categories/category.model';
import { connectionOptions } from './config/connection.options';

describe('005 - Insert categories with parent', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert categories with parent', async () => {

		const categories: any = await connection.getEntityManager(CategoryModel).save([
			{
				name: 'Category 1.1',
				parent: {
					name: 'Category 1',
				},
			},
			{
				name: 'Category 2.1',
				parent: {
					name: 'Category 2',
				},
			},
		]);

		expect(categories.length).toBe(2);
		expect(categories[0].id).toEqual('9');
		expect(categories[0].parent.id).toEqual('1');
		expect(categories[1].id).toEqual('10');
		expect(categories[1].parent.id).toEqual('2');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, parent_id
			FROM categories
			WHERE id IN (9, 10)
			ORDER BY id`);

		expect(query.length).toEqual(2);
		for (let i = 0; i < query.length; i++) {
			expect(query[i].id).toEqual((9 + i).toString());
			expect(query[i].parent_id).toEqual((1 + i).toString());
		}

	});

});

