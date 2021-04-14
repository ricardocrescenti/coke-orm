import { Column, CreatedAtColumn, DeletedAtColumn, PrimaryColumn, UpdatedAtColumn } from "../../decorators";
import { Generate } from "../../metadata/add-ons/generate";
import { CokenModel } from "../../table-manager/coken-model";

export abstract class PatternModel extends CokenModel {

   @PrimaryColumn({ 
      default: new Generate('sequence')
   })
   public id?: bigint;

   @Column({ 
      type: 'uuid', 
      nullable: false,
      default: new Generate('uuid') 
   })
   public uuid?: string;

   @CreatedAtColumn()
   public createdAt?: Date;

   @UpdatedAtColumn()
   public updatedAt?: Date;

   @DeletedAtColumn()
   public deletedAt?: Date;

   constructor(object: any = null) {
      super();
   }

}