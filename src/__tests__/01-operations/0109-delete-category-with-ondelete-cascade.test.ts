import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { CategoryModel } from '../../samples/models/categories/category.model';
import { connectionOptions } from './config/connection.options';

describe('008 - Delete category with onDelete cascade', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Delete category with onDelete cascade', async () => {

		const categoryDeleted: any = await connection.getEntityManager(CategoryModel).delete([
			{
				name: 'Category 5.1',
			},
		]);

		expect(categoryDeleted).toBe(true);

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, parent_id
			FROM categories
			WHERE (id = 15 or parent_id = 15)
			ORDER BY name`);

		expect(query.length).toEqual(0);

	});

});

