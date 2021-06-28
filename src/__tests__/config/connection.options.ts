import { ConnectionOptions } from '../../connection';
import { CategoryModel } from '../models/category.model';

export const connectionOptions: ConnectionOptions = {
	driver: 'postgres',
	user: 'cokeorm',
	password: 'cokeorm',
	database: 'cokeorm',
	host: 'localhost',
	entities: [
		CategoryModel,
	],
	triggers: [],
	subscribers: [],
	logger: false,
};
