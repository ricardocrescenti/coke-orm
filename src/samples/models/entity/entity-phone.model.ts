import { Column, ManyToOne, Table, Unique } from "../../../decorators";
import { PatternModel } from "../pattern.model";
import { EntityModel } from "./entity.model";

@Table({ name: 'entities_phones' })
@Unique({ columns: ['entity', 'phoneNumber'] })
export class EntityPhoneModel extends PatternModel {

	@ManyToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column() //{ nullable: true, enum: [PhoneType] }
	type?: number;//PhoneType;

	@Column({ name: 'phone_number' })
	phoneNumber?: string;

	@Column({ name: 'branch_line', nullable: true })
	branchLine?: string;

	@Column({ nullable: true })
	contact?: string;

	constructor(object: any = null) {
		super(object);

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.entity)) {
		// 		this.entity = this.createEntityModel(object.entity);
		// 	}
		// }
	}

	// eslint-disable-next-line no-unused-vars
	//abstract createEntityModel(object: any): EntityModel;
}