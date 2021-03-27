import { Column, ManyToOne, OneToOne, Table, Unique } from "../../../decorators";
import { QueryExecutor } from "../../../query-executor/query-executor";
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

	constructor(object = null) {
		super(object);

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.entity)) {
		// 		this.entity = this.createEntityModel(object.entity);
		// 	}

		// 	if (!Utility.isEmpty(object.priceList)) {
		// 		this.priceList = this.createPriceListModel(object.priceList);
		// 	}
		// }
	}

	// eslint-disable-next-line no-unused-vars
	//abstract createEntityModel(object: any): EntityModel;
	// eslint-disable-next-line no-unused-vars
	//abstract createPriceListModel(object: any): PriceListModel;

	public async loadReference(queryExecutor: QueryExecutor) {
		await super.loadReference(queryExecutor);

		if (this.entity) {
			await this.entity.loadReferenceByParent(queryExecutor, this);
		}
		
		return this.id;
	}
}