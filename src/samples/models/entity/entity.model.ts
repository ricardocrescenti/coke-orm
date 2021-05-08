import { Connection } from "../../../connection/connection";
import { BeforeLoadPrimaryKey, Column, ManyToOne, OneToMany, OneToOne, Table } from "../../../decorators";
import { TableMetadata } from "../../../metadata/tables/table-metadata";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { TableManager } from "../../../table-manager/table-manager";
import { FileModel } from "../file/file.model";
import { PatternModel } from "../pattern.model";
import { EntityAddressModel } from "./entity-address.model";
import { EntityDocumentModel } from "./entity-document.model";
import { EntityPhoneModel } from "./entity-phone.model";

@Table({ name: 'entities' })
export class EntityModel extends PatternModel {

	@Column()
	name?: string;

	@Column({ nullable: true })
	displayName?: string;

	@Column({ nullable: true })
	email?: string;

	@Column({ nullable: true })//, enum: [PersonType]
	type?: number;//PersonType;

	@Column({ default: 201 }) //, enum: [TimezoneType]
	timezone?: number;//TimezoneType;

	@OneToMany({ relation: { referencedTable: 'EntityPhoneModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
	phones?: Array<EntityPhoneModel>;

	@Column({ nullable: true })
	birthDate?: Date;

	@Column({ nullable: true })//, enum: [PersonGender]
	gender?: number;//PersonGender;

	@OneToMany({ relation: { referencedTable: 'EntityDocumentModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
	documents?: Array<EntityDocumentModel>;

	@OneToMany({ relation: { referencedTable: 'EntityAddressModel', referencedColumn: 'entity', cascade: ['insert', 'update','remove'] } })
	addresses?: Array<EntityAddressModel>;

	@ManyToOne({ nullable: true, relation: { referencedTable: 'FileModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	photo?: FileModel;

	constructor(object: any = null) {
		super(object);
	}

	public async loadPrimaryKey(queryExecutor: QueryExecutor | Connection, requester: any = null): Promise<boolean> {

		if (requester) {
			await requester.loadPrimaryKey(queryExecutor, requester);
			return this.loadReferenceByParent(queryExecutor, null, requester);
		}
		return super.loadPrimaryKey(queryExecutor, requester);

	}

	private async loadReferenceByParent(queryExecutor: QueryExecutor | Connection, teste: any, parent: PatternModel): Promise<boolean> {
		
		if (parent?.id) {
			const result = await queryExecutor.query(`
				select e.id, e.uuid
				from ${queryExecutor.getTableManager(parent.constructor.name).tableMetadata.name} p
				inner join entities e on (e.id = p.entity_id)
				where p.id = ${parent.id}
			`);

			if (result.rows.length > 0) {
				this.id = result.rows[0].id;
				this.uuid = result.rows[0].uuid;
			}
		}

		return this.loadPrimaryKey(queryExecutor, null);

	}

}