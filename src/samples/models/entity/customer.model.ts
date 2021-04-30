import { Connection } from "../../../connection/connection";
import { Column, ManyToOne, OneToOne, Table, Unique } from "../../../decorators";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { TableManager } from "../../../table-manager/table-manager";
import { PatternModel } from "../pattern.model";
import { PriceListModel } from "../product/price-list.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'customers' })
@Unique({ columns: ['entity'] })
export class CustomerModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@ManyToOne({ relation: { referencedTable: 'PriceListModel', referencedColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	priceList?: PriceListModel;

	@Column({ nullable: false, default: 1 }) //, enum: [Status]
	status?: number;//Status;

	public loadPrimaryKey(queryExecutor: QueryExecutor | Connection, requester: any = null): Promise<boolean> {
		
		if (this.entity) {
			return this.entity.loadReferenceByParent(queryExecutor, queryExecutor.getTableManager('EntityModel'), this);
		}
		return super.loadPrimaryKey(queryExecutor);
	
	}

}