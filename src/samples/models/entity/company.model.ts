/* eslint-disable require-jsdoc */
import { Column, OneToOne, Entity, Unique } from '../../../decorators';
import { Status } from '../../enums/status.enum';
import { PatternModel } from '../../../__tests__/models/pattern.model';
import { EntityModel } from './entity.model';

@Entity({ name: 'companies' })
@Unique({ columns: ['entity'] })
export class CompanyModel extends PatternModel {

	@OneToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ default: 1 }) // , enum: [Status]
	status?: Status;

}
