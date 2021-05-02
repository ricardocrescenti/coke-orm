import { Connection } from "../../../connection/connection";
import { BeforeLoadPrimaryKey, Column, OneToOne, Table, Unique } from "../../../decorators";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { TableManager } from "../../../table-manager/table-manager";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'sellers' })
@Unique({ columns: ['entity'] })
export class SellerModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ length: 18, precision: 5, nullable: true, default: 0 })
	comission?: number;

	@Column({ default: 1 }) //, enum: [Status]
	status?: number;//Status;

}