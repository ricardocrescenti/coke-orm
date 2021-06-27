import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { connectionOptions } from './config/connection.options';
import { CategoryEntity } from './models/category.entity';

describe('002 - Synchronizing entities with the database', () => {
	let connection: Connection;

	beforeAll(async () => {
		connectionOptions.entities?.push(CategoryEntity);
		connection = await CokeORM.connect(connectionOptions);
	});

	it('Synchronizing entities with the database', async () => {
		connection.migrations.syncronize();
	});

});

