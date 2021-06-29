/* eslint-disable require-jsdoc */
import { Column, Entity, Unique } from '../../../decorators';
import { PatternModel } from '../../../__tests__/models/pattern.model';

@Entity({ name: 'cities' })
@Unique({ columns: ['name', 'state', 'country'] })
@Unique({ columns: ['code', 'state', 'country'] })
export class CityModel extends PatternModel {

	@Column()
	code?: string;

	@Column()
	name?: string;

	@Column()
	state?: string;

	@Column()
	country?: string;

}
