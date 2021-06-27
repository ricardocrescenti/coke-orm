/* eslint-disable require-jsdoc */
import { Column, CreatedAtColumn, DeletedIndicator, Entity, ManyToOne, OneToMany, PrimaryKeyColumn, Unique, UpdatedAtColumn } from '../../../decorators';
import { VirtualColumn } from '../../../decorators/columns/virtual-column';
import { CokeModel } from '../../../manager';
import { Generate } from '../../../metadata';

@Entity({ name: 'categories' })
@Unique({ columns: ['name'] })
export class CategoryEntity extends CokeModel {

	@PrimaryKeyColumn({ default: new Generate({ strategy: 'sequence' }) })
	public id?: bigint;

	@CreatedAtColumn()
	public createdAt?: Date;

	@UpdatedAtColumn()
	public updatedAt?: Date;

	@DeletedIndicator()
	public deleted?: boolean;

	@Column()
	public name?: string;

	@ManyToOne({ nullable: true, relation: { referencedEntity: 'CategoryEntity', referencedColumn: 'id' } })
	public parent?: CategoryEntity;

	@VirtualColumn()
	public virtual: string = 'batatinha';

	@OneToMany({ relation: { referencedEntity: 'CategoryEntity', referencedColumn: 'parent', cascade: ['insert', 'update'] } })
	public children?: CategoryEntity[];

}
