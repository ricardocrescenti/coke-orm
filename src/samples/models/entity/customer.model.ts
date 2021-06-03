import { Column, ManyToOne, OneToOne, Table, Unique } from "../../../decorators";
import { Status } from "../../enums/status.enum";
import { PatternModel } from "../pattern.model";
import { PriceListModel } from "../product/price-list.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'customers' })
@Unique({ columns: ['entity'] })
export class CustomerModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@ManyToOne({ nullable: true, relation: { referencedTable: 'PriceListModel', referencedColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	priceList?: PriceListModel;

	@Column({ default: 1 }) //, enum: [Status]
	status?: Status;

}