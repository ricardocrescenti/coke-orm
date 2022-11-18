import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { ProductModel } from '../models/product.model';

describe('Insert product with variations separately', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert product with variations separately', async () => {

		const product3: any = await connection.getEntityManager(ProductModel).save({
			name: 'Product 3',
			attributes: [
				{
					uuid: 'd0728e0c-5313-40c6-8d09-3a580a14e31f',
					name: 'COLOR',
				},
				{
					uuid: '5a790943-a269-4df2-a27e-956ccddceeb1',
					name: 'SIZE',
				},
			],
		});
		const product3w20: any = await connection.getEntityManager(ProductModel).save({
			name: 'Product 3 WHITE 20',
			attributesOptions: [
				{
					productAttribute: {
						uuid: 'd0728e0c-5313-40c6-8d09-3a580a14e31f',
					},
					name: 'WHITE',
				},
				{
					productAttribute: {
						uuid: '5a790943-a269-4df2-a27e-956ccddceeb1',
					},
					name: '20',
				},
			],
			parent: {
				name: 'Product 3',
			},
		});
		const product3r20: any = await connection.getEntityManager(ProductModel).save({
			name: 'Product 3 RED 20',
			attributesOptions: [
				{
					productAttribute: {
						uuid: 'd0728e0c-5313-40c6-8d09-3a580a14e31f',
					},
					name: 'RED',
				},
				{
					productAttribute: {
						uuid: '5a790943-a269-4df2-a27e-956ccddceeb1',
					},
					name: '20',
				},
			],
			parent: {
				name: 'Product 3',
			},
		});

		expect(product3.id?.toString()).toEqual('3');
		expect(product3.attributes.length).toEqual(2);
		expect(product3.attributes[0].id?.toString()).toEqual('1');
		expect(product3.attributes[1].id?.toString()).toEqual('2');
		expect(product3w20.id?.toString()).toEqual('4');
		expect(product3w20.attributesOptions[0].id?.toString()).toEqual('1');
		expect(product3w20.attributesOptions[1].id?.toString()).toEqual('2');
		expect(product3r20.id?.toString()).toEqual('5');
		expect(product3r20.attributesOptions[0].id?.toString()).toEqual('3');
		expect(product3r20.attributesOptions[1].id?.toString()).toEqual('4');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, name
			FROM products
			WHERE (id = 3 or parent_id = 3)
			ORDER BY id`);

		expect(query.length).toEqual(3);
		for (let i = 0; i < query.length; i++) {
			expect(query[i].id?.toString()).toEqual((3 + i).toString());
		}

	});

});

