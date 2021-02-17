import { Column, CreatedAtColumn, DeletedAtColumn, PrimaryColumn, UpdatedAtColumn } from "../../../decorators";

export abstract class PatterModel {

   @PrimaryColumn()
   public id?: bigint;

   @Column()
   public uuid?: string;

   @CreatedAtColumn()
   public createdAt?: Date;

   @UpdatedAtColumn()
   public updatedAt?: Date;

   @DeletedAtColumn()
   public deletedAt?: Date;

}