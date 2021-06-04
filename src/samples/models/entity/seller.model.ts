import { Column, OneToOne, Entity, Unique } from "../../../decorators";
import { Status } from "../../enums/status.enum";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Entity({ name: 'sellers', orderBy: { 'comission': 'ASC' } })
@Unique({ columns: ['entity'] })
export class SellerModel extends PatternModel {

	@OneToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE', eager: true } })
	entity?: EntityModel;

	@Column({ length: 18, precision: 5, nullable: true, default: 0 })
	comission?: number;

	@Column({ default: 1 }) //, enum: [Status]
	status?: Status;

}