/* eslint-disable require-jsdoc */
import { Column, ManyToOne, Entity, Unique } from '../../../decorators';
import { PatternModel } from '../../../__tests__/models/pattern.model';
import { EntityModel } from './entity.model';

@Entity({ name: 'entities_phones', orderBy: { type: 'ASC', phoneNumber: 'ASC' } })
@Unique({ columns: ['entity', 'phoneNumber'] })
export class EntityPhoneModel extends PatternModel {

	@ManyToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column() // { nullable: true, enum: [PhoneType] }
	type?: number; // PhoneType;

	@Column()
	phoneNumber?: string;

	@Column({ nullable: true })
	branchLine?: string;

	@Column({ nullable: true })
	contact?: string;

}
