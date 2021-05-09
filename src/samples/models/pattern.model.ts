import { Column, CreatedAtColumn, DeletedAtColumn, PrimaryColumn, Unique, UpdatedAtColumn } from "../../decorators";
import { Generate } from "../../metadata/add-ons/generate";
import { CokenModel } from "../../table-manager/coken-model";

@Unique({ columns: ['uuid'] })
export abstract class PatternModel extends CokenModel {

   @PrimaryColumn({ 
      default: new Generate({ strategy: 'sequence' })
   })
   public id?: bigint;

   @Column({ 
      type: 'uuid', 
      nullable: false,
      default: new Generate({ strategy: 'uuid' }) 
   })
   public uuid?: string;

   @CreatedAtColumn()
   public createdAt?: Date;

   @UpdatedAtColumn()
   public updatedAt?: Date;

   @Column({ nullable: true })
   public deletedAt?: Date;

   constructor(object: any = null) {
      super();
   }

}