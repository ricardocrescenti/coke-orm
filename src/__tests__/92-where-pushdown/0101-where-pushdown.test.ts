import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';

describe('Where pushdown (Fases 1 and 2)', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('saves the test tree', async () => {

		const em = connection.getEntityManager(CategoryModel);

		// clean the tree saved by a previous run of this suite
		await connection.queryRunner.query(`DELETE FROM categories WHERE name LIKE 'Pushdown %'`);

		const root = await em.save({ name: 'Pushdown Root' });
		const parent = await em.save({ name: 'Pushdown Parent', parent: { id: root.id } as any });
		const child1 = await em.save({ name: 'Pushdown Child 1', parent: { id: parent.id } as any });
		const child2 = await em.save({ name: 'Pushdown Child 2', parent: { id: parent.id } as any });
		const grandChild = await em.save({ name: 'Pushdown Grandchild', parent: { id: child1.id } as any });

		expect(root.id?.toString()).toBeTruthy();
		expect(parent.id?.toString()).toBeTruthy();
		expect(child1.id?.toString()).toBeTruthy();
		expect(child2.id?.toString()).toBeTruthy();
		expect(grandChild.id?.toString()).toBeTruthy();

	});

	it('Fase 1/2: parent relation filter is pushed into the subquery and restricted by exists', async () => {

		const em = connection.getEntityManager(CategoryModel);

		const findOptions = {
			relations: ['parent'],
			where: { parent: { name: { equal: 'Pushdown Root' } } as any },
		};

		// the generated SQL must contain the condition pushed into the parent
		// subquery and the exists restriction against the root filter
		const sql = em.createSelectQuery(findOptions as any, 0).getQuery();
		expect(sql).toContain('exists (select 1 from "public"."categories" "CategoryModel_Filter"');
		expect(sql).toContain('"CategoryModel"."name" = $');
		expect(sql).toContain('"parent_CategoryModel"."name" = $');
		expect(sql).toContain('"parent_CategoryModel"."parent"->>\'name\'');

		// the pushed filter must not change the result
		const found = await em.find(findOptions as any);
		expect(found.length).toEqual(1);
		expect(found[0].name).toEqual('Pushdown Parent');
		expect(found[0].parent?.name).toEqual('Pushdown Root');

	});

	it('Fase 2: the children subquery is restricted by exists against the root filter', async () => {

		const em = connection.getEntityManager(CategoryModel);

		// the exists must restrict the children aggregation to the rows
		// reachable from the root rows that satisfy the root filter
		const sql = em.createSelectQuery({
			relations: ['children'],
			where: {
				name: { iLike: 'Pushdown Parent%' } as any,
				children: { name: { equal: 'Pushdown Child 1' } } as any,
			},
		}, 0).getQuery();
		expect(sql).toContain('exists (select 1 from "public"."categories" "CategoryModel_Filter"');
		expect(sql).toContain('"CategoryModel_Filter"."name" ilike $');
		expect(sql).toContain('"CategoryModel"."parent_id" = "CategoryModel_Filter"."id"');

		const found = await em.find({
			relations: ['children'],
			where: {
				name: { iLike: 'Pushdown Parent%' } as any,
				children: { name: { equal: 'Pushdown Child 1' } } as any,
			},
		});
		expect(found.length).toEqual(1);
		expect(found[0].name).toEqual('Pushdown Parent');
		expect(found[0].children?.map((child: any) => child.name)).toEqual(['Pushdown Child 1', 'Pushdown Child 2']);

	});

	it('Fase 2: deep chain (children.children) restricts the nested subqueries', async () => {

		const em = connection.getEntityManager(CategoryModel);

		// the intermediate chain join must correlate the levels with the
		// foreign key on the deeper entity (OneToMany direction)
		const sql = em.createSelectQuery({
			relations: ['children', 'children.children'],
			where: {
				name: { iLike: 'Pushdown Parent%' } as any,
				children: { children: { name: { equal: 'Pushdown Grandchild' } } as any } as any,
			},
		}, 0).getQuery();
		expect(sql).toContain('"CategoryModel_Filter1"."parent_id" = "CategoryModel_Filter"."id"');
		expect(sql).toContain('"CategoryModel"."parent_id" = "CategoryModel_Filter1"."id"');

		const found = await em.find({
			relations: ['children', 'children.children'],
			where: {
				name: { iLike: 'Pushdown Parent%' } as any,
				children: { children: { name: { equal: 'Pushdown Grandchild' } } as any } as any,
			},
		});
		expect(found.length).toEqual(1);
		expect(found[0].name).toEqual('Pushdown Parent');
		expect(found[0].children?.map((child: any) => child.name)).toEqual(['Pushdown Child 1', 'Pushdown Child 2']);
		expect(found[0].children?.[0]?.children?.map((grandChild: any) => grandChild.name)).toEqual(['Pushdown Grandchild']);

	});

	it('OR-safety: conditions inside or arrays must not be pushed (results stay equivalent)', async () => {

		const em = connection.getEntityManager(CategoryModel);

		// the array where forces the aggregation (sha1) path, without pushdown
		const pushed = await em.find({
			relations: ['parent'],
			where: { parent: { name: { equal: 'Pushdown Root' } } as any },
		});
		const fallback = await em.find({
			relations: ['parent'],
			where: [{ parent: { name: { equal: 'Pushdown Root' } } as any }],
		});

		expect(fallback.length).toEqual(pushed.length);
		expect(fallback.length).toEqual(1);
		expect(fallback[0].name).toEqual(pushed[0].name);

	});

});