import { Column, ManyToOne, Entity, Unique } from "../../../decorators";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Entity({ name: 'entities_documents' })
@Unique({ columns: ['entity', 'type'] })
export class EntityDocumentModel extends PatternModel {

	@ManyToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column()
	type?: string;

	@Column()
	document?: string;

}