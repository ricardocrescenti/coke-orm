import { Connection } from "../../../connection/connection";
import { Column, ManyToOne, Table, Unique } from "../../../decorators";
import { TableManager } from "../../../table-manager/table-manager";
import { PatternModel } from "../pattern.model";
import { CityModel } from "./city.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'entities_addresses' })
@Unique({ columns: ['contact', 'street', 'number', 'neighborhood', 'complement', 'reference', 'city', 'zipCode', 'entity'] })
export class EntityAddressModel extends PatternModel {

	@ManyToOne({ name: 'entity_id', relation: { referencedTable: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column()
	description?: string;

	@Column()
	contact?: string;

	@Column()
	street?: string;

	@Column()
	number?: string;

	@Column()
	neighborhood?: string;

	@Column()
	complement?: string;

	@Column()
	reference?: string;

	@ManyToOne({ relation: { referencedTable: 'CityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	city?: CityModel;

	@Column({ name: 'zip_code', nullable: true })
	zipCode?: string;

	@Column({ name: 'is_default', nullable: true })
	isDefault?: boolean;

	@Column({ type: 'point', nullable: true })
	coordinate?: string;

	constructor(object = null) {
		super(object);

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.entity)) {
		// 		this.entity = this.createEntityModel(object.entity);
		// 	}

		// 	if (!Utility.isEmpty(object.city)) {
		// 		this.city = this.createCityModel(object.city);
		// 	}
		// }
	}

	// eslint-disable-next-line no-unused-vars
	//abstract createEntityModel(object: any): EntityModel;
	// eslint-disable-next-line no-unused-vars
	//abstract createCityModel(object: any): CityModel;

	public async loadPrimaryKey(tableManager: TableManager<this> | Connection | string) {
		tableManager = this.getTableManager(tableManager);

		// if ((this.zipCode ?? '').length > 0) {
		// 	this.city = await this.getCity(tableManager);
		// 	await this.city?.save(tableManager);
		// }

		return super.loadPrimaryKey(tableManager);

		// return await super.getReference(entityManager, where ?? (Utility.isNotEmpty(this.entity?.id) ? {
		// 	contact: this.contact,
		// 	street: this.street,
		// 	number: this.number,
		// 	neighborhood: this.neighborhood,
		// 	complement: this.complement,
		// 	reference: this.reference,
		// 	city: this.city,
		// 	zipCode: this.zipCode,
		// 	entity: this.entity
		// } : null));
	}

	// public async getCity(tableManager: TableManager<this>) {
	// 	if (this.city) {
	// 		await this.city.loadReference(tableManager);
	// 	}

	// 	if ((this.city?.id ?? 0) == 0) {

	// 		this.city = new CityModel({
	// 			code: '123456789',
	// 			name: 'Guaporé',
	// 			state: 'RS',
	// 			country: 'BRA'
	// 		});
	// 		await this.city.loadReference(tableManager);

	// 	}

	// 	if ((this.city?.id ?? 0) > 0) {
	// 		this.city = new CityModel({ id: this.city?.id });
	// 	}

	// 	return this.city;
	// }
}