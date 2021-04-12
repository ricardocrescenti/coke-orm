import { Column, OneToMany, OneToOne, Table } from "../../../decorators";
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

	@Column({ nullable: false })
	name?: string;

	@Column()
	displayName?: string;

	@Column()
	email?: string;

	@Column()//, enum: [PersonType]
	type?: number;//PersonType;

	@Column({ nullable: false, default: 201 }) //, enum: [TimezoneType]
	timezone?: number;//TimezoneType;

	@OneToMany({ relation: { referencedTable: 'EntityPhoneModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
	phones?: Array<EntityPhoneModel>;

	@Column()
	birthDate?: Date;

	@Column()//, enum: [PersonGender]
	gender?: number;//PersonGender;

	@OneToMany({ relation: { referencedTable: 'EntityDocumentModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
	documents?: Array<EntityDocumentModel>;

	@OneToMany({ relation: { referencedTable: 'EntityAddressModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
	addresses?: Array<EntityAddressModel>;

	@OneToOne({ relation: { referencedTable: 'FileModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
	photo?: FileModel;

	constructor(object: any = null) {
		super(object);

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (!Utility.isEmpty(object.phones)) {
		// 		this.phones = new Array<EntityPhoneModel>();

		// 		for (let phone of object.phones) {
		// 			this.phones.push(this.createEntityPhoneModel(phone));
		// 		}
		// 	}

		// 	if (!Utility.isEmpty(object.documents)) {
		// 		this.documents = new Array<EntityDocumentModel>();

		// 		for (let document of object.documents) {
		// 			this.documents.push(this.createEntityDocumentModel(document));
		// 		}
		// 	}

		// 	if (!Utility.isEmpty(object.addresses)) {
		// 		this.addresses = new Array<EntityAddressModel>();

		// 		for (let address of object.addresses) {
		// 			this.addresses.push(this.createEntityAddressModel(address));
		// 		}
		// 	}

		// 	if (!Utility.isEmpty(object.photo)) {
		// 		this.photo = this.createFileModel(object.photo, 'entities/photos');
		// 	}
		// }
	}

	// eslint-disable-next-line no-unused-vars
	//abstract createEntityPhoneModel(object: any): EntityPhoneModel;
	// eslint-disable-next-line no-unused-vars
	//abstract createEntityDocumentModel(object: any): EntityDocumentModel;
	// eslint-disable-next-line no-unused-vars
	//abstract createEntityAddressModel(object: any): EntityAddressModel;
	// eslint-disable-next-line no-unused-vars
	//abstract createFileModel(object: any, path: string): FileModel;

	// eslint-disable-next-line no-unused-vars
	public async loadReference(tableManager: TableManager<this>, requester: any = null): Promise<this> {
		// if (Utility.isNotEmpty(requester) && Utility.isEmpty(requester.id)) {
		// 	return Promise.resolve(this);
		// }
		// return super.loadReferences(entityManager, requester);
		console.log(requester);
		delete requester.id;
		return this;
	}

	public async loadReferenceByParent(tableManager: TableManager<this>, parent: PatternModel) {
		// if (Utility.isNotEmpty(parent?.id)) {
		// 	const [entity] = await entityManager.query(`
		// 		select e.id, e.uuid
		// 		from ${entityManager.getRepository(parent.constructor.name).metadata.givenTableName} p
		// 			inner join entities e on (e.id = p.entity_id)
		// 		where p.id = ${parent.id}
		// 	`);

		// 	if (Utility.isNotEmpty(entity)) {
		// 		this.id = entity.id;
		// 		this.uuid = entity.uuid;
		// 	}
		// }
		// await this.loadReferences(entityManager, null);
	}
}