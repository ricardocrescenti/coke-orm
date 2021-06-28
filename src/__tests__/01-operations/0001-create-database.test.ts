import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from './config/connection.options';

describe('001 - Create test database', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect({
			...connectionOptions,
			entities: [],
			triggers: [],
			subscribers: [],
		});
	});

	it('Drop Current Schema', async () => {
		const result = await connection.queryRunner.query(`DROP SCHEMA IF EXISTS "public" CASCADE;`);
		expect(result).toEqual([]);
	});

	it('Create Empty Schema', async () => {
		const result = await connection.queryRunner.query(`CREATE SCHEMA "public";`);
		expect(result).toEqual([]);
	});

});
