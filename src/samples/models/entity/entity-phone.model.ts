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

}