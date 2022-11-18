import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { ProductModel } from '../models/product.model';

describe('Insert product with variations children', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Insert product with variations children', async () => {

		const product: any = await connection.getEntityManager(ProductModel).save({
			name: 'Product 4',
			attributes: [
				{
					uuid: 'f25e2f5c-a045-43c6-97c2-025a2ca286db',
					name: 'COLOR',
				},
				{
					uuid: '2e5ba4eb-214a-4fbc-89e4-eabed6157be3',
					name: 'SIZE',
				},
			],
			children: [
				{
					name: 'Product 4 WHITE 20',
					attributesOptions: [
						{
							productAttribute: {
								uuid: 'f25e2f5c-a045-43c6-97c2-025a2ca286db',
							},
							name: 'WHITE',
						},
						{
							productAttribute: {
								uuid: '2e5ba4eb-214a-4fbc-89e4-eabed6157be3',
							},
							name: '20',
						},
					],
				},
				{
					name: 'Product 4 RED 20',
					attributesOptions: [
						{
							productAttribute: {
								uuid: 'f25e2f5c-a045-43c6-97c2-025a2ca286db',
							},
							name: 'RED',
						},
						{
							productAttribute: {
								uuid: '2e5ba4eb-214a-4fbc-89e4-eabed6157be3',
							},
							name: '20',
						},
					],
				},
			],
		});

		expect(product.id?.toString()).toEqual('6');
		expect(product.attributes?.length).toEqual(2);
		expect(product.attributes[0].id?.toString()).toEqual('3');
		expect(product.attributes[1].id?.toString()).toEqual('4');
		expect(product.children?.length).toEqual(2);
		expect(product.children[0].id?.toString()).toEqual('7');
		expect(product.children[0].attributesOptions?.length).toEqual(2);
		expect(product.children[0].attributesOptions[0].id?.toString()).toEqual('5');
		expect(product.children[0].attributesOptions[1].id?.toString()).toEqual('6');
		expect(product.children[1].id?.toString()).toEqual('8');
		expect(product.children[1].attributesOptions?.length).toEqual(2);
		expect(product.children[1].attributesOptions[0].id?.toString()).toEqual('7');
		expect(product.children[1].attributesOptions[1].id?.toString()).toEqual('8');

	});

	it('Check data saved in the database', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT id, name
			FROM products
			WHERE (id = 6 or parent_id = 6)
			ORDER BY id`);

		expect(query.length).toEqual(3);
		for (let i = 0; i < query.length; i++) {
			expect(query[i].id?.toString()).toEqual((6 + i).toString());
		}

	});

});

