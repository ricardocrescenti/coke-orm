import { Connection } from "../../../connection/connection";
import { Column, OneToOne, Table, Unique } from "../../../decorators";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { TableManager } from "../../../table-manager/table-manager";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'collaborators' })
@Unique({ columns: ['entity'] })
export class CollaboratorModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ default: 1 }) //, enum: [Status]
	status?: number; //Status;

}