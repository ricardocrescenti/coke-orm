import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';

describe('Insert categories with parent and children', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert categories with parent and children', async () => {

		const categories: any = await connection.getEntityManager(CategoryModel).save([
			{
				name: 'Category 5.1',
				parent: {
					name: 'Category 5',
				},
				children: [
					{
						name: 'Category 5.1.1',
					},
				],
			},
			{
				name: 'Category 6.1',
				parent: {
					name: 'Category 6',
				},
				children: [
					{
						name: 'Category 6.1.1',
					},
					{
						name: 'Category 6.1.2',
					},
				],
			},
			{
				name: 'Category 9',
			},
			{
				name: 'Category 9.1',
				parent: {
					name: 'Category 9',
				},
			},
		]);

		expect(categories.length).toBe(4);
		expect(categories[0].id?.toString()).toEqual('15');
		expect(categories[0].parent.id?.toString()).toEqual('5');
		expect(categories[0].children[0].id?.toString()).toEqual('16');
		expect(categories[1].id?.toString()).toEqual('17');
		expect(categories[1].parent.id?.toString()).toEqual('6');
		expect(categories[1].children[0].id?.toString()).toEqual('18');
		expect(categories[1].children[1].id?.toString()).toEqual('19');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, parent_id
			FROM categories
			WHERE (id IN (15, 17) or parent_id IN (15, 17))
			ORDER BY name`);

		expect(query.length).toEqual(5);
		expect(query[0].id?.toString()).toEqual('15');
		expect(query[0].parent_id?.toString()).toEqual('5');
		expect(query[1].id?.toString()).toEqual('16');
		expect(query[1].parent_id?.toString()).toEqual('15');
		expect(query[2].id?.toString()).toEqual('17');
		expect(query[2].parent_id?.toString()).toEqual('6');
		expect(query[3].id?.toString()).toEqual('18');
		expect(query[3].parent_id?.toString()).toEqual('17');
		expect(query[4].id?.toString()).toEqual('19');
		expect(query[4].parent_id?.toString()).toEqual('17');

	});

});

