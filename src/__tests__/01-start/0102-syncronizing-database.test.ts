import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from '../config/connection.options';

describe('002 - Synchronizing entities with the database', () => {
	let connection: Connection;

	beforeAll(async () => {
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Synchronizing entities with the database', async () => {
		await connection.migrations.syncronize();
	});

});

