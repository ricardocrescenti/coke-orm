/* eslint-disable require-jsdoc */
import { Column, Entity, ManyToOne, OneToMany, Unique, VirtualColumn } from '../../decorators';
import { PatternModel } from './pattern.model';

@Entity({ name: 'categories' })
@Unique({ columns: ['name'] })
export class CategoryModel extends PatternModel {

   @Column()
   public name?: string;

   @ManyToOne({ nullable: true, relation: { referencedEntity: 'CategoryModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public parent?: CategoryModel;

   @VirtualColumn()
   public virtual: string = 'Virtual column';

   @OneToMany({ relation: { referencedEntity: 'CategoryModel', referencedColumn: 'parent', cascade: ['insert', 'update'] } })
   public children?: CategoryModel[];

}
