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

   @ManyToOne({ nullable: true, relation: { referencedEntity: 'CategoryModel', referencedColumn: 'id' } })
   public parent?: CategoryModel;

   @VirtualColumn()
   public virtual: string = 'batatinha';

   @OneToMany({ relation: { referencedEntity: 'CategoryModel', referencedColumn: 'parent' } })
   public children?: CategoryModel[];

}