/* eslint-disable require-jsdoc */
import { Column, Entity, ManyToOne, OneToMany, Unique } from '../../decorators';
import { FileModel } from './file.model';
import { PatternModel } from './pattern.model';
import { ProductAttributeOptionModel } from './product-attribute-options.model';
import { ProductAttributeModel } from './product-attribute.model';
import { ProductCategoryModel } from './product-category.model';

@Entity({ name: 'products' })
@Unique({ columns: ['name'] })
export class ProductModel extends PatternModel {

	@Column()
	public name?: string;

	@OneToMany({ relation: { referencedEntity: 'ProductCategoryModel', referencedColumn: 'product', cascade: ['insert', 'update', 'remove'] } })
	public categories?: ProductCategoryModel[];

	@OneToMany({ relation: { referencedEntity: 'ProductAttributeModel', referencedColumn: 'product', cascade: ['insert', 'update', 'remove'] } })
	public attributes?: ProductAttributeModel[];

	@OneToMany({ relation: { referencedEntity: 'ProductAttributeOptionModel', referencedColumn: 'product', cascade: ['insert', 'update', 'remove'] } })
	public attributesOptions?: ProductAttributeOptionModel[];

	@Column({ length: 18, precision: 5, default: 0 })
	public cost?: number;

	@ManyToOne({ nullable: true, relation: { referencedEntity: 'FileModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE', cascade: ['insert', 'update'] }, parseValue: (entityManager, columnMetadata, entity, values) => {

		const file = entityManager.connection.getEntityManager(FileModel).create(values);
		file.test = '1';
		return file;

	} })
	public image?: FileModel;

	@Column({ nullable: true })
	public releaseDate?: Date;

	@Column({ nullable: true })
	public releasedForSale?: boolean;

	@Column({ nullable: true })
	public price?: number;

	@ManyToOne({ nullable: true, relation: { referencedEntity: 'ProductModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
	public parent?: ProductModel;

	@OneToMany({ relation: { referencedEntity: 'ProductModel', referencedColumn: 'parent', cascade: ['insert', 'update'] } })
	public children?: ProductModel[];

}
