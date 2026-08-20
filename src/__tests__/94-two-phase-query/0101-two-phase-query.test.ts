import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';
import { CategoryModel } from '../models/category.model';
import { ProductModel } from '../models/product.model';

describe('Two phase query (find with OneToMany filter + limit)', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
		// clean the tree saved by a previous run of this suite
		await connection.queryRunner.query(`DELETE FROM products WHERE name LIKE 'TwoPhase %'`);
		await connection.queryRunner.query(`DELETE FROM categories WHERE name LIKE 'TwoPhase %'`);
	});

	it('saves the test tree', async () => {

		const em = connection.getEntityManager(ProductModel);
		const categoryEm = connection.getEntityManager(CategoryModel);

		const parent: any = await em.save({
			name: 'TwoPhase Parent',
			barcodes: [{ barcode: 'TwoPhase-BR-1' }, { barcode: 'TwoPhase-BR-2' }],
		} as any);
		const category: any = await categoryEm.save({ name: 'TwoPhase Category' } as any);
		const child: any = await em.save({
			name: 'TwoPhase Child',
			parent: { id: parent.id } as any,
			barcodes: [{ barcode: 'TwoPhase-BR-3' }],
			categories: [{ category: { id: category.id } as any }] as any,
		} as any);

		expect(parent.id?.toString()).toBeTruthy();
		expect(child.id?.toString()).toBeTruthy();

	});

	it('Fase 1: the ids query replaces the OneToMany condition with a correlated exists', async () => {

		const em = connection.getEntityManager(ProductModel);

		const sql = em.createIdsQuery({
			where: {
				name: { iLike: 'TwoPhase %' } as any,
				barcodes: { barcode: { iLike: '%TwoPhase-BR-1%' } } as any,
			},
			limit: 10,
		} as any).getQuery();

		expect(sql).toContain('exists (select 1 from "public"."products_barcodes" "ProductBarCodeModel_Filter1"');
		expect(sql).toContain('"ProductBarCodeModel_Filter1"."product_id" = "ProductModel"."id"');
		expect(sql).toContain('"ProductBarCodeModel_Filter1"."barcode" ilike $');
		expect(sql).toContain('"ProductModel"."name" ilike $');
		expect(sql).toContain('LIMIT 10');

	});

	it('Fase 1: deep chain (children.barcodes) joins the intermediate levels', async () => {

		const em = connection.getEntityManager(ProductModel);

		const sql = em.createIdsQuery({
			where: {
				children: { barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } } as any,
			},
			limit: 10,
		} as any).getQuery();

		expect(sql).toContain('from "public"."products_barcodes" "ProductBarCodeModel_Filter2"');
		expect(sql).toContain('left join "public"."products" "ProductModel_Filter1" on "ProductBarCodeModel_Filter2"."product_id" = "ProductModel_Filter1"."id"');
		expect(sql).toContain('"ProductModel_Filter1"."parent_id" = "ProductModel"."id"');
		expect(sql).toContain('"ProductBarCodeModel_Filter2"."barcode" ilike $');

	});

	it('Fase 2: the query is restricted to the resolved ids (root and subquery)', async () => {

		const em = connection.getEntityManager(ProductModel);

		// the second phase where is built by the find method: the original
		// where conjunctively combined with the ids restriction
		const sql = em.createSelectQuery({
			relations: ['barcodes'],
			where: {
				id: { in: ['1', '2'] },
				AND: {
					name: { iLike: 'TwoPhase %' } as any,
				},
			} as any,
		} as any, 0, undefined, undefined, ['1', '2']).getQuery();

		// the root where is restricted by the ids of the first phase
		expect(sql).toContain('"ProductModel"."id" in (');
		// the level 1 OneToMany subquery is restricted by the foreign key
		expect(sql).toContain('"ProductBarCodeModel"."product_id" in (');
		// the root filter exists restricts the subquery to the loaded page
		expect(sql).toContain('"ProductModel_Filter"."id" in (');

	});

	it('find with OneToMany filter and limit resolves the same records of the single query', async () => {

		const em = connection.getEntityManager(ProductModel);

		// without limit the two phase query is not activated (single query)
		const all = await em.find({
			relations: ['barcodes'],
			where: {
				name: { iLike: 'TwoPhase %' } as any,
				barcodes: { barcode: { iLike: '%TwoPhase-BR-1%' } } as any,
			},
		});

		// with limit the two phase query is activated and must resolve the
		// same records in the same order
		const page = await em.find({
			relations: ['barcodes'],
			where: {
				name: { iLike: 'TwoPhase %' } as any,
				barcodes: { barcode: { iLike: '%TwoPhase-BR-1%' } } as any,
			},
			limit: 10,
		});

		expect(all.length).toEqual(1);
		expect(page.length).toEqual(all.length);
		expect(page[0].id?.toString()).toEqual(all[0].id?.toString());
		expect(page[0].name).toEqual('TwoPhase Parent');
		expect(page[0].barcodes?.map((barcode: any) => barcode.barcode)).toEqual(['TwoPhase-BR-1', 'TwoPhase-BR-2']);

	});

	it('pagination (skip + limit) is consistent between the two phases', async () => {

		const em = connection.getEntityManager(ProductModel);

		// each find gets its own where object (the orm mutates the passed
		// where while adjusting the relation conditions)
		const findOptions = (skip: number) => ({
			relations: ['barcodes'],
			where: {
				barcodes: { barcode: { iLike: 'TwoPhase-BR-%' } } as any,
			},
			orderBy: { name: 'ASC' },
			skip,
			limit: 1,
		});

		const page1 = await em.find(findOptions(0) as any);
		const page2 = await em.find(findOptions(1) as any);

		expect(page1.length).toEqual(1);
		expect(page2.length).toEqual(1);
		expect(page1[0].id?.toString()).not.toEqual(page2[0].id?.toString());

		// ordered by name: 'TwoPhase Child' comes before 'TwoPhase Parent'
		const names = [page1[0].name, page2[0].name].sort();
		expect(names).toEqual(['TwoPhase Child', 'TwoPhase Parent']);

	});

	it('find with deep chain condition (children.barcodes)', async () => {

		const em = connection.getEntityManager(ProductModel);

		const found = await em.find({
			relations: ['children', 'children.barcodes'],
			where: {
				children: { barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } } as any,
			},
			limit: 10,
		} as any);

		expect(found.length).toEqual(1);
		expect(found[0].name).toEqual('TwoPhase Parent');
		expect(found[0].children?.map((child: any) => child.name)).toEqual(['TwoPhase Child']);
		expect(found[0].children?.[0]?.barcodes?.map((barcode: any) => barcode.barcode)).toEqual(['TwoPhase-BR-3']);

	});

	it('OR-safety: the or array where stays equivalent to the object where', async () => {

		const em = connection.getEntityManager(ProductModel);

		// each find gets its own where object (the orm mutates the passed
		// where while adjusting the relation conditions)
		const condition = () => ({ barcodes: { barcode: { iLike: '%TwoPhase-BR-1%' } } as any });

		const viaOr = await em.find({ relations: ['barcodes'], where: [condition()], limit: 10 } as any);
		const viaObject = await em.find({ relations: ['barcodes'], where: condition(), limit: 10 } as any);

		expect(viaOr.length).toEqual(1);
		expect(viaOr.length).toEqual(viaObject.length);
		expect(viaOr[0]?.id?.toString()).toEqual(viaObject[0]?.id?.toString());
		expect(viaOr[0]?.name).toEqual('TwoPhase Parent');

	});

	it('Fase 1: sibling relations in the same condition are conjunctive and every join is in scope', async () => {

		const em = connection.getEntityManager(ProductModel);

		const sql = em.createIdsQuery({
			where: {
				children: {
					barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } as any,
					categories: { category: { name: { iLike: '%TwoPhase Category%' } } } as any,
				} as any,
			} as any,
			limit: 10,
		} as any).getQuery();

		// the deepest level (categories chain) is the 'from' of the exists
		// body and the intermediate levels are joined in scope order: every
		// alias referenced by an 'on' condition is introduced by the 'from'
		// or an earlier join (before the fix the first join referenced a
		// table joined later, raising 'missing FROM-clause entry')
		expect(sql).toContain('exists (select 1 from "public"."categories" "CategoryModel_Filter4"');
		expect(sql).toContain('left join "public"."products_categories" "ProductCategoryModel_Filter3" on "ProductCategoryModel_Filter3"."category_id" = "CategoryModel_Filter4"."id"');
		expect(sql).toContain('left join "public"."products" "ProductModel_Filter1" on "ProductCategoryModel_Filter3"."product_id" = "ProductModel_Filter1"."id"');
		expect(sql).toContain('left join "public"."products_barcodes" "ProductBarCodeModel_Filter2" on "ProductBarCodeModel_Filter2"."product_id" = "ProductModel_Filter1"."id"');
		expect(sql).toContain('"ProductModel_Filter1"."parent_id" = "ProductModel"."id"');
		// both sibling conditions are kept (no silent drop)
		expect(sql).toContain('"ProductBarCodeModel_Filter2"."barcode" ilike $');
		expect(sql).toContain('"CategoryModel_Filter4"."name" ilike $');

	});

	it('Fase 1: the sibling joins stay in scope in the reversed order', async () => {

		const em = connection.getEntityManager(ProductModel);

		const sql = em.createIdsQuery({
			where: {
				children: {
					categories: { category: { name: { iLike: '%TwoPhase Category%' } } } as any,
					barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } as any,
				} as any,
			} as any,
			limit: 10,
		} as any).getQuery();

		expect(sql).toContain('exists (select 1 from "public"."products_barcodes" "ProductBarCodeModel_Filter4"');
		expect(sql).toContain('left join "public"."products" "ProductModel_Filter1" on "ProductBarCodeModel_Filter4"."product_id" = "ProductModel_Filter1"."id"');
		expect(sql).toContain('left join "public"."products_categories" "ProductCategoryModel_Filter2" on "ProductCategoryModel_Filter2"."product_id" = "ProductModel_Filter1"."id"');
		expect(sql).toContain('left join "public"."categories" "CategoryModel_Filter3" on "ProductCategoryModel_Filter2"."category_id" = "CategoryModel_Filter3"."id"');
		expect(sql).toContain('"ProductBarCodeModel_Filter4"."barcode" ilike $');
		expect(sql).toContain('"CategoryModel_Filter3"."name" ilike $');

	});

	it('Fase 1: nested sibling chains (3 levels) keep every join in scope', async () => {

		const em = connection.getEntityManager(ProductModel);

		const sql = em.createIdsQuery({
			where: {
				children: {
					categories: { category: { parent: { name: { iLike: '%TwoPhase%' } } } } as any,
					barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } as any,
				} as any,
			} as any,
			limit: 10,
		} as any).getQuery();

		expect(sql).toContain('exists (select 1 from "public"."products_barcodes" "ProductBarCodeModel_Filter5"');
		expect(sql).toContain('left join "public"."products" "ProductModel_Filter1" on "ProductBarCodeModel_Filter5"."product_id" = "ProductModel_Filter1"."id"');
		expect(sql).toContain('left join "public"."products_categories" "ProductCategoryModel_Filter2" on "ProductCategoryModel_Filter2"."product_id" = "ProductModel_Filter1"."id"');
		expect(sql).toContain('left join "public"."categories" "CategoryModel_Filter3" on "ProductCategoryModel_Filter2"."category_id" = "CategoryModel_Filter3"."id"');
		expect(sql).toContain('left join "public"."categories" "CategoryModel_Filter4" on "CategoryModel_Filter3"."parent_id" = "CategoryModel_Filter4"."id"');
		expect(sql).toContain('"CategoryModel_Filter4"."name" ilike $');
		expect(sql).toContain('"ProductBarCodeModel_Filter5"."barcode" ilike $');

	});

	it('Fase 1: the ids query with sibling relations executes (no FROM-clause error)', async () => {

		const em = connection.getEntityManager(ProductModel);

		const builder = em.createIdsQuery({
			where: {
				children: {
					barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } as any,
					categories: { category: { name: { iLike: '%TwoPhase Category%' } } } as any,
				} as any,
			} as any,
			limit: 10,
		} as any);

		// before the fix this query crashed with 'missing FROM-clause entry
		// for table ...' (an 'on' condition referenced a table joined later)
		const rows: any[] = await builder.execute(connection.queryRunner);

		// the sibling conditions are conjunctive: the child matches both
		// (barcode + category), so the parent is resolved
		expect(rows.length).toEqual(1);

	});

	it('Fase 1: sibling conditions are conjunctive (no silent drop)', async () => {

		const em = connection.getEntityManager(ProductModel);

		const builder = em.createIdsQuery({
			where: {
				children: {
					barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } as any,
					categories: { category: { name: { iLike: '%TwoPhase NO MATCH%' } } } as any,
				} as any,
			} as any,
			limit: 10,
		} as any);

		const rows: any[] = await builder.execute(connection.queryRunner);

		// the child has the barcode but no category with this name: before
		// the fix the category condition was silently dropped and the parent
		// was wrongly resolved
		expect(rows.length).toEqual(0);

	});

	it('find with sibling relations in the same condition (end to end)', async () => {

		const em = connection.getEntityManager(ProductModel);

		// each find gets its own where object (the orm mutates the passed
		// where while adjusting the relation conditions)
		const where = (category: string) => ({
			children: {
				barcodes: { barcode: { iLike: '%TwoPhase-BR-3%' } } as any,
				categories: { category: { name: { iLike: `%${category}%` } } } as any,
			} as any,
		});
		const findOptions = (category: string) => ({
			relations: ['children', 'children.barcodes', 'children.categories', 'children.categories.category'],
			where: where(category),
			limit: 10,
		});

		// the child matches both conditions (barcode + category)
		const matching = await em.find(findOptions('TwoPhase Category') as any);
		expect(matching.length).toEqual(1);
		expect(matching[0].name).toEqual('TwoPhase Parent');
		expect(matching[0].children?.map((child: any) => child.name)).toEqual(['TwoPhase Child']);

		// the child has the barcode but no category with this name: the
		// conditions are conjunctive, so nothing matches
		const notMatching = await em.find(findOptions('TwoPhase NO MATCH') as any);
		expect(notMatching.length).toEqual(0);

	});

});