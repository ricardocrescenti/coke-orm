/* eslint-disable require-jsdoc */
import { Column, Entity, ManyToOne, Unique } from '../../decorators';
import { PatternModel } from './pattern.model';
import { ProductModel } from './product.model';

@Entity({ name: 'products_barcodes' })
@Unique({ columns: ['product', 'barcode'] })
export class ProductBarCodeModel extends PatternModel {

   @ManyToOne({ relation: { referencedEntity: 'ProductModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public product?: ProductModel;

   @Column()
   public barcode?: string;

}
