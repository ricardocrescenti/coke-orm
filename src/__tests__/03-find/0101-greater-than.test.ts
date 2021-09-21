import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';

describe('Find (greaterThan)', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Finding', async () => {

		const categories: CategoryModel[] = await connection.getEntityManager(CategoryModel).find({
			where: {
				name: { greaterThan: '' },
			},
		});
		expect(categories.length).toEqual(19);

	});

});

