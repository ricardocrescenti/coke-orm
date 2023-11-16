/* eslint-disable require-jsdoc */
import { Column, Entity, Unique } from '../../../decorators';
import { PatternModel } from '../../../__tests__/models/pattern.model';

@Entity({ name: 'cities' })
@Unique({ columns: ['name', 'state', 'country'], onError: (entity, unique, queryRunner, error) => { throw Error('Já existe outra cidade com o mesmo nome na cidade e estado informado') } })
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
