import { Column, OneToOne, Table, Unique } from "../../../decorators";
import { TableMetadata } from "../../../metadata/tables/table-metadata";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { TableManager } from "../../../table-manager/table-manager";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'collaborators' })
@Unique({ columns: ['entity'] })
export class CollaboratorModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ nullable: false, default: 1 }) //, enum: [Status]
	status?: number; //Status;

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

	public async loadReference(tableManager: TableManager<this>) {
		await super.loadReference(tableManager);

		if (this.entity) {
			await this.entity.loadReferenceByParent(tableManager.connection.createTableManager('EntityModel'), this);
		}
		
		return this.id;
	}
}