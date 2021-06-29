/* eslint-disable require-jsdoc */
import { Column, ManyToOne, Entity } from '../../../decorators';
import { PatternModel } from '../../../__tests__/models/pattern.model';

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

}
