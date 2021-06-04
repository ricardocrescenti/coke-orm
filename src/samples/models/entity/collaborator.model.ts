import { Column, OneToOne, Entity, Unique } from "../../../decorators";
import { Status } from "../../enums/status.enum";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Entity({ name: 'collaborators' })
@Unique({ columns: ['entity'] })
export class CollaboratorModel extends PatternModel {

	@OneToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ default: 1 }) //, enum: [Status]
	status?: Status;

}