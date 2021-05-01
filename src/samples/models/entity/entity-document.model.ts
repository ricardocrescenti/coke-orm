import { Column, ManyToOne, Table, Unique } from "../../../decorators";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'entities_documents' })
@Unique({ columns: ['entity', 'type'] })
export class EntityDocumentModel extends PatternModel {

	@ManyToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column()
	type?: string;

	@Column()
	document?: string;

}