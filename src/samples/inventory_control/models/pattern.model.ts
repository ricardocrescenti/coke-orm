import { Column, PrimaryColumn } from "../../../decorators";

export abstract class PatterModel {

   @PrimaryColumn()
   public id?: bigint;

   @Column()
   public uuid?: string;

   @Column()
   public createdAt?: Date;

   @Column()
   public updatedAt?: Date;

   @Column()
   public deletedAt?: Date;

}