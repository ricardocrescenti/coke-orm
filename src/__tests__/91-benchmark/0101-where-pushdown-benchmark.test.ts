import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';

describe('Where pushdown benchmark', () => {
	let connection: Connection;

	jest.setTimeout(120000);

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('saves 1,000 roots with 3 children each', async () => {

		const em = connection.getEntityManager(CategoryModel);

		await connection.queryRunner.query(`DELETE FROM categories WHERE name LIKE 'Benchmark Root%' OR name LIKE 'Benchmark Child%'`);

		for (let batch = 0; batch < 10; batch++) {
			const objects: any[] = [];
			for (let i = 0; i < 100; i++) {
				const rootName = `Benchmark Root ${(batch * 100 + i).toString().padStart(4, '0')}`;
				objects.push({ name: rootName });
			}
			await em.save(objects);
		}

		for (let batch = 0; batch < 10; batch++) {
			const objects: any[] = [];
			for (let i = 0; i < 100; i++) {
				const rootIndex = batch * 100 + i;
				for (let child = 1; child <= 3; child++) {
					objects.push({ name: `Benchmark Child ${rootIndex.toString().padStart(4, '0')}-${child}` });
				}
			}
			const children: any[] = (await em.save(objects as any)) as any[];
			for (let i = 0; i < 100; i++) {
				const root = await em.findOne({ where: { name: { equal: `Benchmark Root ${(batch * 100 + i).toString().padStart(4, '0')}` } } });
				for (let child = 0; child < 3; child++) {
					children[i * 3 + child].parent = { id: root?.id } as any;
				}
			}
			await em.save(children);
		}

		const count: any = await connection.queryRunner.query(`SELECT COUNT(*) AS total FROM categories WHERE name LIKE 'Benchmark Root%' OR name LIKE 'Benchmark Child%'`);
		expect(Number(count[0].total)).toEqual(4000);

	});

	it('filtering on the parent is not slower than the aggregation fallback', async () => {

		const em = connection.getEntityManager(CategoryModel);

		// conjunctive where: condition pushed into the parent subquery
		const pushedStart = Date.now();
		const pushed = await em.find({
			relations: ['parent'],
			where: { parent: { name: { equal: 'Benchmark Root 0500' } } as any },
		});
		const pushedTime = Date.now() - pushedStart;

		// or array where: forces the aggregation (sha1) path without pushdown
		const fallbackStart = Date.now();
		const fallback = await em.find({
			relations: ['parent'],
			where: [{ parent: { name: { equal: 'Benchmark Root 0500' } } as any }],
		});
		const fallbackTime = Date.now() - fallbackStart;

		// both paths must return the same result
		expect(pushed.length).toEqual(3);
		expect(fallback.length).toEqual(3);
		expect(pushed.map((item) => item.id?.toString()).sort()).toEqual(fallback.map((item) => item.id?.toString()).sort());

		// generous upper bound to avoid flakiness: the pushed path must not be
		// meaningfully slower than the aggregation fallback
		expect(pushedTime).toBeLessThan(fallbackTime * 2 + 1000);

		console.log(`pushdown: ${pushedTime}ms, fallback (sha1): ${fallbackTime}ms`);

	});

});