import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';

describe('Delete non-existent category', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Delete non-existent category', async () => {

		const categoryDeleted: any = await connection.getEntityManager(CategoryModel).delete([
			{
				name: 'Non-existent Category',
			},
		]);

		expect(categoryDeleted).toBe(false);

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT COUNT(*)
			FROM categories`);

		expect(query[0]['count']).toEqual('19');

	});

});

