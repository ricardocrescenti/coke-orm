import { Connection } from "../../../connection/connection";
import { Column, ManyToOne, Table, Unique } from "../../../decorators";
import { QueryExecutor } from "../../../query-executor/query-executor";
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