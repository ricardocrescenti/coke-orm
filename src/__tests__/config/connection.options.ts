import { ConnectionOptions } from '../../connection';
import { CategoryModel } from '../models/category.model';
import { ProductAttributeOptionModel } from '../models/product-attribute-options.model';
import { ProductAttributeModel } from '../models/product-attribute.model';
import { ProductCategoryModel } from '../models/product-category.model';
import { ProductModel } from '../models/product.model';

export const connectionOptions: ConnectionOptions = {
	driver: 'postgres',
	user: 'cokeorm',
	password: 'cokeorm',
	database: 'cokeorm',
	host: 'localhost',
	entities: [
		CategoryModel,
		ProductModel,
		ProductCategoryModel,
		ProductAttributeModel,
		ProductAttributeOptionModel,
	],
	triggers: [],
	subscribers: [],
	logger: false,
};
