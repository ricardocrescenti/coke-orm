/* eslint-disable require-jsdoc */
import { Entity, ManyToOne, Unique } from '../../decorators';
import { CategoryModel } from './category.model';
import { PatternModel } from './pattern.model';
import { ProductModel } from './product.model';

@Entity({ name: 'products_categories' })
@Unique({ columns: ['product', 'category'] })
export class ProductCategoryModel extends PatternModel {

   @ManyToOne({ relation: { referencedEntity: 'ProductModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public product?: ProductModel;

   @ManyToOne({ relation: { referencedEntity: 'CategoryModel', referencedColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
   public category?: CategoryModel;

}
