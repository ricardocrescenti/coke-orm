import { Column, OneToOne, Table, Unique } from "../../../decorators";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'sellers' })
@Unique({ columns: ['entity'] })
export class SellerModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ nullable: true, length: 18, precision: 5, default: 0 })
	comission?: number;

	@Column({ nullable: false, default: 1 }) //, enum: [Status]
	status?: number;//Status;

	constructor(object = null) {
		super();

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.entity)) {
		// 		this.entity = this.createEntityModel(object.entity);
		// 	}
		// }
	}

	// eslint-disable-next-line no-unused-vars
	//abstract createEntityModel(object: any): EntityModel;

	public async loadReference(queryExecutor: QueryExecutor) {
		await super.loadReference(queryExecutor);

		if (this.entity) {
			await this.entity.loadReferenceByParent(queryExecutor, this);
		}
		
		return this.id;
	}
}