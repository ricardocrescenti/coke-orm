/* eslint-disable require-jsdoc */
import { Column, DeletedIndicator, Entity, ManyToOne, OneToMany, Unique } from '../../../decorators';
import { VirtualColumn } from '../../../decorators/columns/virtual-column';
import { PatternModel } from '../pattern.model';

@Entity({ name: 'categories' })
@Unique({ columns: ['name'] })
export class CategoryModel extends PatternModel {

   @DeletedIndicator()
   public deleted?: boolean;

   @Column()
   public name?: string;

   @ManyToOne({ nullable: true, relation: { referencedEntity: 'CategoryModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
   public parent?: CategoryModel;

   @VirtualColumn()
   public virtual: string = 'batatinha';

   @OneToMany({ relation: { referencedEntity: 'CategoryModel', referencedColumn: 'parent', cascade: ['insert', 'update'] } })
   public children?: CategoryModel[];

}
