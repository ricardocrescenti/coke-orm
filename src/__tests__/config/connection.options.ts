import { ConnectionOptions } from '../../connection';
import { CategoryModel } from '../models/category.model';
import { FileModel } from '../models/file.model';
import { FileSubscriber } from '../models/file.subscriber';
import { ProductAttributeOptionModel } from '../models/product-attribute-options.model';
import { ProductAttributeModel } from '../models/product-attribute.model';
import { ProductBarCodeModel } from '../models/product-barcode.model';
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
		ProductBarCodeModel,
		ProductCategoryModel,
		ProductAttributeModel,
		ProductAttributeOptionModel,
		FileModel,
	],
	triggers: [],
	subscribers: [
		FileSubscriber,
	],
	logger: false,
};
