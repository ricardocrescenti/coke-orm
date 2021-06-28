/* eslint-disable require-jsdoc */
import { Column, Entity, ManyToOne, OneToMany, Unique } from '../../decorators';
import { PatternModel } from './pattern.model';
import { ProductAttributeOptionModel } from './product-attribute-options.model';
import { ProductAttributeModel } from './product-attribute.model';

@Entity({ name: 'products' })
@Unique({ columns: ['name'] })
export class ProductModel extends PatternModel {

   @Column()
   public name?: string;

   @OneToMany({ relation: { referencedEntity: 'ProductAttributeModel', referencedColumn: 'product', cascade: ['insert', 'update'] } })
   public attributes?: ProductAttributeModel[];

   @OneToMany({ relation: { referencedEntity: 'ProductAttributeOptionModel', referencedColumn: 'product', cascade: ['insert', 'update'] } })
   public attributesOptions?: ProductAttributeOptionModel[];

   @ManyToOne({ nullable: true, relation: { referencedEntity: 'ProductModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public parent?: ProductModel;

   @OneToMany({ relation: { referencedEntity: 'ProductModel', referencedColumn: 'parent', cascade: ['insert', 'update'] } })
   public children?: ProductModel[];

}
