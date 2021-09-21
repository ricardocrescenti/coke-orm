import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { ProductModel } from '../models/product.model';

describe('Create product with image', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert categories separately', async () => {

		const product = await connection.getEntityManager(ProductModel).save({
			name: 'Product With Image',
			image: {
				privateUrl: 'privateurl/image.jpg',
			},
		});

		expect(product.image?.test).toEqual('3');
		expect(product.image?.privateUrl).toEqual(product.image?.publicUrl);

	});

});

