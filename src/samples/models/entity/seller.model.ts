import { Connection } from "../../../connection/connection";
import { BeforeLoadPrimaryKey, Column, OneToOne, Table, Unique } from "../../../decorators";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { TableManager } from "../../../table-manager/table-manager";
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

	public loadPrimaryKey(queryExecutor: QueryExecutor | Connection, requester: any = null): Promise<boolean> {
		
		if (this.entity) {
			return this.entity.loadReferenceByParent(queryExecutor, queryExecutor.getTableManager('EntityModel'), this);
		}
		return super.loadPrimaryKey(queryExecutor);
	
	}
}