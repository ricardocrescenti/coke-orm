import { Column, PrimaryColumn, Entity } from "../decorators";
import { Generate } from "../metadata";
import { CokeModel } from "../manager";

@Entity()
export class MigrationModel extends CokeModel {

    @PrimaryColumn({ 
        default: new Generate({ strategy: 'sequence' }) 
    })
    public id?: bigint;

    @Column()
    public createdAt?: Date;

    @Column()
    public name?: string;

    @Column({ 
        default: 'CURRENT_TIMESTAMP' 
    })
    public executedAt?: Date;

}