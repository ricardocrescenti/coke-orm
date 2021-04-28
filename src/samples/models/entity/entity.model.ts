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

	@ManyToOne({ relation: { referencedTable: 'FileModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
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

	@BeforeLoadPrimaryKey()
	public async loadPrimaryKey(tableManager: TableManager<this>, requester: any = null): Promise<this> {

		if (requester && !requester.id) {
			return Promise.resolve(this);
		}
		return super.loadPrimaryKey(tableManager, requester);

	}

	public async loadReferenceByParent(parentTableManager: TableManager<this>, parent: PatternModel) {
		
		if (parent?.id) {
			const [entity] = await parentTableManager.queryExecutor.query(`
				select e.id, e.uuid
				from ${parentTableManager.tableMetadata.name} p
				inner join entities e on (e.id = p.entity_id)
				where p.id = ${parent.id}
			`);

			if (entity) {
				this.id = entity.id;
				this.uuid = entity.uuid;
			}
		}

		await this.loadPrimaryKey(parentTableManager, null);

	}
}