import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { ProductModel } from '../models/product.model';

describe('Insert product simple removing one category', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert product simple with categories', async () => {

		const product: any = await connection.getEntityManager(ProductModel).save({
			name: 'Product 5',
			categories: [
				{
					category: {
						name: 'Category 1 (changed)',
					},
				},
			],
		});

		expect(product.id).toEqual('9');
		expect(product.categories.length).toEqual(1);
		expect(product.categories[0].id).toEqual('1');
		expect(product.categories[0].category.id).toEqual('1');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, category_id
			FROM products_categories
			WHERE product_id = 9
			ORDER BY id`);

		expect(query.length).toEqual(1);
		expect(query[0].id).toEqual('1');
		expect(query[0].category_id).toEqual('1');

	});

});

