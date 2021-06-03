import { Column, OneToOne, Table, Unique } from '../../../decorators';
import { Status } from '../../enums/status.enum';
import { PatternModel } from '../pattern.model';
import { EntityModel } from './entity.model';

@Table({ name: 'carriers' })
@Unique({ columns: ['entity'] })
export class CarrierModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ nullable: true })
	site?: string;

	@Column({ type: 'integer', default: 1 }) //enum: [Status], 
	status?: Status;

}