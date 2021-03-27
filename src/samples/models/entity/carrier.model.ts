import { Column, OneToOne, Table, Unique } from '../../../decorators';
import { PatternModel } from '../pattern.model';
import { QueryExecutor } from '../../../query-executor/query-executor';
import { EntityModel } from './entity.model';

@Table({ name: 'carriers' })
@Unique({ columns: ['entity'] })
export class CarrierModel extends PatternModel {

	@OneToOne({ relation: { referencedTable: 'EntityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	entity?: EntityModel;

	@Column()
	site?: string;

	@Column({ type: 'integer', nullable: false, default: 1 }) //enum: [Status], 
	status?: number; //Status;

	constructor(object: any = null) {
		super(object);

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.entity)) {
		// 		this.entity = this.createEntityModel(object.entity);
		// 	}
		// }
	}

	public async loadReference(queryExecutor: QueryExecutor): Promise<any> {
		await super.loadReference(queryExecutor);

		if (this.entity) {
			await this.entity.loadReferenceByParent(queryExecutor, this);
		}
		
		return this.id;
	}
}