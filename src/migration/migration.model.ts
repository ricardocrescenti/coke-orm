import { Column, PrimaryColumn, Table } from "../decorators";
import { Generate } from "../metadata/add-ons/generate";
import { CokenModel } from "../table-manager/coken-model";

@Table()
export class Migration extends CokenModel {

    @PrimaryColumn({ 
        default: new Generate({ strategy: 'sequence' }) 
    })
    public id?: bigint;

    @Column()
    public name?: string;

    @Column()
    public createdAt?: Date;

    @Column({ 
        default: 'CURRENT_TIMESTAMP' 
    })
    public executedAt?: Date;

}