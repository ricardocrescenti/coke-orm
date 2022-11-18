import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { ProductModel } from '../models/product.model';

describe('Find (greaterThan)', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Finding', async () => {

		const products: ProductModel[] = await connection.getEntityManager(ProductModel).find({
			relations: [
				'barcodes'
			],
			where: {
				barcodes: {
					barcode: { iLike: '789%' },
				} as any,
			},
		});
		expect(products.length).toEqual(2);

	});

});

