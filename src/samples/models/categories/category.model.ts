import { Column, Entity, ManyToOne, OneToMany, Trigger, Unique } from "../../../decorators";
import { PatternModel } from "../pattern.model";

@Entity({ name: 'categories' })
@Unique({ columns: ['name'] })
export class CategoryModel extends PatternModel {

   @Column()
   public name?: string;

   @ManyToOne({ nullable: true,  relation: { referencedEntity: 'CategoryModel', referencedColumn: 'id' } })
   public parent?: CategoryModel;

   @OneToMany({ relation: { referencedEntity: 'CategoryModel', referencedColumn: 'parent' } })
   public children?: CategoryModel[];

}