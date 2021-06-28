/* eslint-disable require-jsdoc */
import { Column, Entity, ManyToOne, Unique } from '../../decorators';
import { PatternModel } from './pattern.model';
import { ProductModel } from './product.model';

@Entity({ name: 'products_attributes' })
@Unique({ columns: ['product', 'name'] })
export class ProductAttributeModel extends PatternModel {

   @ManyToOne({ relation: { referencedEntity: 'ProductModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public product?: ProductModel;

   @Column()
   public name?: string;;

}
