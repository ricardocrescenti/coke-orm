import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';

describe('Insert categories with children', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert categories with children', async () => {

		const categories: any = await connection.getEntityManager(CategoryModel).save([
			{
				name: 'Category 3',
				children: [
					{
						name: 'Category 3.1',
					},
					{
						name: 'Category 3.2',
					},
				],
			},
			{
				name: 'Category 4',
				children: [
					{
						name: 'Category 4.1',
					},
					{
						name: 'Category 4.2',
					},
				],
			},
		]);

		expect(categories.length).toBe(2);
		expect(categories[0].id?.toString()).toEqual('3');
		expect(categories[0].children[0].id?.toString()).toEqual('11');
		expect(categories[0].children[1].id?.toString()).toEqual('12');
		expect(categories[1].id?.toString()).toEqual('4');
		expect(categories[1].children[0].id?.toString()).toEqual('13');
		expect(categories[1].children[1].id?.toString()).toEqual('14');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, parent_id
			FROM categories
			WHERE parent_id IN (3, 4)
			ORDER BY id`);

		expect(query.length).toEqual(4);
		for (let i = 0; i < query.length; i++) {
			expect(query[i].id?.toString()).toEqual((11 + i).toString());
			expect(query[i].parent_id?.toString()).toEqual((i < 2 ? 3 : 4).toString());
		}

	});

});

