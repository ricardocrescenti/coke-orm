import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { CategoryModel } from '../../samples/models/categories/category.model';
import { connectionOptions } from './config/connection.options';

describe('008 - Delete category', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Delete category', async () => {

		const categories: any = await connection.getEntityManager(CategoryModel).save([
			{
				id: 1,
				name: 'Category 1 (changed)',
				children: [
					{
						id: 9,
						name: 'Category 1.1 (changed)',
					},
				],
			},
		]);

		expect(categories.length).toBe(1);
		expect(categories[0].id).toEqual('1');
		expect(categories[0].name).toEqual('Category 1 (changed)');
		expect(categories[0].children[0].id).toEqual('9');
		expect(categories[0].children[0].name).toEqual('Category 1.1 (changed)');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, name, parent_id
			FROM categories
			WHERE id in (1,9)
			ORDER BY id`);

		expect(query.length).toEqual(2);
		expect(query[0].id).toEqual('1');
		expect(query[0].name).toEqual('Category 1 (changed)');
		expect(query[1].id).toEqual('9');
		expect(query[1].name).toEqual('Category 1.1 (changed)');
		expect(query[1].parent_id).toEqual('1');

	});

});

