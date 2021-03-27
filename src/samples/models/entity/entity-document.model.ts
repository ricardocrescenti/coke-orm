import { Column, ManyToOne, Table, Unique } from "../../../decorators";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'entities_documents' })
@Unique({ columns: ['entity', 'type'] })
export class EntityDocumentModel extends PatternModel {

	@ManyToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ nullable: false })
	type?: string;

	@Column({ nullable: false })
	document?: string;

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
}