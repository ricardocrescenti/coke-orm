/* eslint-disable require-jsdoc */
import { Column, ManyToOne, Entity, Unique } from '../../../decorators';
import { PatternModel } from '../pattern.model';
import { CityModel } from './city.model';
import { EntityModel } from './entity.model';

@Entity({ name: 'entities_addresses' })
@Unique({ columns: ['contact', 'street', 'number', 'neighborhood', 'complement', 'city', 'zipCode', 'entity'] })
export class EntityAddressModel extends PatternModel {

	@ManyToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column({ nullable: true })
	description?: string;

	@Column()
	contact?: string;

	@Column()
	street?: string;

	@Column()
	number?: string;

	@Column()
	neighborhood?: string;

	@Column()
	complement?: string;

	@Column({ nullable: true })
	reference?: string;

	@ManyToOne({ relation: { referencedEntity: 'CityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	city?: CityModel;

	@Column({ name: 'zip_code' })
	zipCode?: string;

	@Column({ name: 'is_default', default: false })
	isDefault?: boolean;

	@Column({ type: 'point', nullable: true })
	coordinate?: string;

}
