import { Column, Table, Unique } from "../../../decorators";
import { PatternModel } from "../pattern.model";

@Table({ name: 'cities' })
@Unique({ columns: ['name', 'state', 'country'] })
@Unique({ columns: ['code', 'state', 'country'] })
export class CityModel extends PatternModel {

	@Column({ nullable: true })
	code?: string;

	@Column()
	name?: string;

	@Column({ nullable: true })
	state?: string;

	@Column({ nullable: true })
	country?: string;

}