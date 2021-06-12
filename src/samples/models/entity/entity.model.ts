import { Column, ManyToOne, OneToMany, Entity } from "../../../decorators";
import { QueryRunner } from "../../../query-runner";
import { FileModel } from "../file/file.model";
import { PatternModel } from "../pattern.model";
import { EntityAddressModel } from "./entity-address.model";
import { EntityDocumentModel } from "./entity-document.model";
import { EntityPhoneModel } from "./entity-phone.model";

@Entity({ name: 'entities' })
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

	@OneToMany({ relation: { referencedEntity: 'EntityPhoneModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
	phones?: Array<EntityPhoneModel>;

	@Column({ nullable: true })
	birthDate?: Date;

	@Column({ nullable: true })//, enum: [PersonGender]
	gender?: number;//PersonGender;

	@OneToMany({ relation: { referencedEntity: 'EntityDocumentModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
	documents?: Array<EntityDocumentModel>;

	@OneToMany({ relation: { referencedEntity: 'EntityAddressModel', referencedColumn: 'entity', cascade: ['insert', 'update','remove'] } })
	addresses?: Array<EntityAddressModel>;

	@ManyToOne({ nullable: true, relation: { referencedEntity: 'FileModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	photo?: FileModel;

	constructor(object: any = null) {
		super(object);
	}

	public async loadPrimaryKey(queryRunner: QueryRunner, requester: any = null): Promise<boolean> {

		if (requester) {
			await requester.loadPrimaryKey(queryRunner, requester);
			return this.loadReferenceByParent(queryRunner, null, requester);
		}
		return super.loadPrimaryKey(queryRunner, requester);

	}

	private async loadReferenceByParent(queryRunner: QueryRunner, teste: any, parent: PatternModel): Promise<boolean> {
		
		if (parent?.id) {
			const result = await queryRunner.query(`
				select e.id, e.uuid
				from ${queryRunner.connection.getEntityManager(parent.constructor.name).metadata.name} p
				inner join entities e on (e.id = p.entity_id)
				where p.id = ${parent.id}
			`);

			if (result.rows.length > 0) {
				this.id = result.rows[0].id;
				this.uuid = result.rows[0].uuid;
			}
		}

		return this.loadPrimaryKey(queryRunner, null);

	}

}