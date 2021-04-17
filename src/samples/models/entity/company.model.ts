import { Connection } from "../../../connection/connection";
import { Column, OneToOne, Table, Unique } from "../../../decorators";
import { TableManager } from "../../../table-manager/table-manager";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'companies' })
@Unique({ columns: ['entity'] })
export class CompanyModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ nullable: false, default: 1 }) //, enum: [Status]
	status?: number;//Status;

	constructor(object: any = null) {
		super(object);

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.entity)) {
		// 		this.entity = this.createEntityModel(object.entity);
		// 	}
		// }
	}

	// eslint-disable-next-line no-unused-vars
	//abstract createEntityModel(object: any): EntityModel;

	public async loadPrimaryKey(tableManager?: TableManager<this> | Connection | string) {
		tableManager = this.getTableManager(tableManager);

		if (this.entity) {
			await this.entity.loadReferenceByParent(tableManager.connection.createTableManager('EntityModel'), this);
		}
		
		return this.id;
	}
}