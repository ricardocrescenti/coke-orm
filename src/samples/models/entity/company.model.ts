import { Column, OneToOne, Table, Unique } from "../../../decorators";
import { Status } from "../../enums/status.enum";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'companies' })
@Unique({ columns: ['entity'] })
export class CompanyModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ default: 1 }) //, enum: [Status]
	status?: Status;

}