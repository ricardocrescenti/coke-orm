import { Column, PrimaryColumn, Table } from "../decorators";
import { Generate } from "../metadata/add-ons/generate";
import { CokeModel } from "../table-manager/coke-model";

@Table()
export class Migration extends CokeModel {

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