import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { ProductModel } from '../models/product.model';

describe('Update product with categories empty', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Update product with categories empty', async () => {

		const product: any = await connection.getEntityManager(ProductModel).save({
			name: 'Product 5',
			categories: [],
		});

		expect(product.id).toEqual('9');
		expect(product.categories.length).toEqual(0);

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, category_id
			FROM products_categories
			WHERE product_id = 9
			ORDER BY id`);

		expect(query.length).toEqual(0);

	});

});

