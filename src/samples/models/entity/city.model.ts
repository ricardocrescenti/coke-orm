import { Column, Table, Unique } from "../../../decorators";
import { PatternModel } from "../pattern.model";

@Table({ name: 'cities' })
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