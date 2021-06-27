import { ConnectionOptions } from '../../../connection';
import { CategoryModel } from '../../../samples/models/categories/category.model';
import { CityModel } from '../../../samples/models/entity/city.model';
import { CustomerModel } from '../../../samples/models/entity/customer.model';
import { EntityAddressModel } from '../../../samples/models/entity/entity-address.model';
import { EntityDocumentModel } from '../../../samples/models/entity/entity-document.model';
import { EntityPhoneModel } from '../../../samples/models/entity/entity-phone.model';
import { EntityModel } from '../../../samples/models/entity/entity.model';
import { SellerModel } from '../../../samples/models/entity/seller.model';
import { FileModel } from '../../../samples/models/file/file.model';
import { PriceListModel } from '../../../samples/models/product/price-list.model';

export const connectionOptions: ConnectionOptions = {
	driver: 'postgres',
	user: 'cokeorm',
	password: 'cokeorm',
	database: 'cokeorm',
	host: 'localhost',
	entities: [
		CategoryModel,
		PriceListModel,
		CustomerModel,
		SellerModel,
		EntityModel,
		EntityAddressModel,
		EntityDocumentModel,
		EntityPhoneModel,
		EntityModel,
		CityModel,
		FileModel,
	],
	triggers: [],
	subscribers: [],
	logger: false,
};
