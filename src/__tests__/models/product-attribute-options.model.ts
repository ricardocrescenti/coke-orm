/* eslint-disable require-jsdoc */
import { Column, Entity, ManyToOne, Unique } from '../../decorators';
import { PatternModel } from './pattern.model';
import { ProductAttributeModel } from './product-attribute.model';
import { ProductModel } from './product.model';

@Entity({ name: 'products_attributes_options' })
@Unique({ columns: ['product', 'productAttribute'] })
export class ProductAttributeOptionModel extends PatternModel {

   @ManyToOne({ relation: { referencedEntity: 'ProductModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public product?: ProductModel;

   @ManyToOne({ relation: { referencedEntity: 'ProductAttributeModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public productAttribute?: ProductAttributeModel;

   @Column()
   public name?: string;;

}
