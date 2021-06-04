import { Column, ManyToOne, Entity } from "../../../decorators";
import { PatternModel } from "../pattern.model";

@Entity({ name: 'prices_lists' })
export class PriceListModel extends PatternModel {

	@Column()
	name?: string;

	@Column({ nullable: true })
	description?: string;

	@ManyToOne({ relation: { referencedEntity: 'PriceListModel', referencedColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	parent?: PriceListModel;

	@Column()
	parentPercentage?: number;

	constructor(object = null, canCreateParent: boolean = true) {
		super();

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.parent) && canCreateParent) {
		// 		this.parent = this.createPriceListModel(object.parent, false);
		// 	}

		// 	if (!Utility.isEmpty(object.currency)) {
		// 		this.currency = this.createCurrencyModel(object.currency);
		// 	}
		// }
	}

	// eslint-disable-next-line no-unused-vars
	//abstract createPriceListModel(object: any, canCreateParent: boolean): PriceListModel;
	// eslint-disable-next-line no-unused-vars
	//abstract createCurrencyModel(object: any): CurrencyModel;
}