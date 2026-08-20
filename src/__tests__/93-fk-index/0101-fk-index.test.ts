import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';

describe('Auto index of foreign keys (Fase 4)', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect({
			...connectionOptions,
			migrations: {
				...connectionOptions.migrations,
				synchronize: true,
			},
			additional: {
				...connectionOptions.additional,
				indexForeignKeys: true,
			},
		});
	});

	it('creates an index on the ManyToOne foreign key column', async () => {

		const query: any[] = await connection.queryRunner.query(`
			SELECT i.relname AS indexname
			FROM pg_index x
			JOIN pg_class i ON i.oid = x.indexrelid
			JOIN pg_class t ON t.oid = x.indrelid
			JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (x.indkey)
			WHERE t.relname = 'categories' AND a.attname = 'parent_id'
			ORDER BY i.relname`);

		expect(query.length).toBeGreaterThan(0);
		expect(query[0].indexname).toMatch(/^IDX_/);

	});

});