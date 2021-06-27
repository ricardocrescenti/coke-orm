import { Column, CreatedAtColumn, DeletedIndicator, PrimaryKeyColumn, Unique, UpdatedAtColumn } from '../../decorators';
import { Generate } from '../../metadata';
import { CokeModel } from '../../manager';

@Unique({ columns: ['uuid'] })
export abstract class PatternModel extends CokeModel {

	@PrimaryKeyColumn({ default: new Generate({ strategy: 'sequence' }) })
	public id?: bigint;

	@Column({ type: 'uuid', nullable: false, default: new Generate({ strategy: 'uuid' }) })
	public uuid?: string;

	@CreatedAtColumn()
	public createdAt?: Date;

	@UpdatedAtColumn()
	public updatedAt?: Date;

	@Column({ nullable: true })
	public deletedAt?: Date;

	@DeletedIndicator()
	public deleted?: boolean;

	constructor(object: any = null) {
		super();
	}

}