import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { ProductModel } from '../models/product.model';

describe('Insert product simple', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert product simple', async () => {

		const products: any = await connection.getEntityManager(ProductModel).save([
			{
				name: 'Product 1',
			},
			{
				name: 'Product 2',
			},
		]);
		expect(products.length).toEqual(2);

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, name
			FROM products
			ORDER BY id`);

		expect(query.length).toEqual(2);
		for (let i = 0; i < query.length; i++) {
			expect(query[i].id).toEqual((i + 1).toString());
			expect(query[i].name).toEqual('Product ' + (i + 1).toString());
		}

	});

});

