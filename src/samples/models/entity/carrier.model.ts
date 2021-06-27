/* eslint-disable require-jsdoc */
import { Column, OneToOne, Entity, Unique } from '../../../decorators';
import { Status } from '../../enums/status.enum';
import { PatternModel } from '../pattern.model';
import { EntityModel } from './entity.model';

@Entity({ name: 'carriers' })
@Unique({ columns: ['entity'] })
export class CarrierModel extends PatternModel {

	@OneToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ nullable: true })
	site?: string;

	@Column({ type: 'integer', default: 1 }) // enum: [Status],
	status?: Status;

}
