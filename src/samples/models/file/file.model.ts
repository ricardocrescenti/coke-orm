import { Column, Entity } from "../../../decorators";
import { PatternModel } from "../pattern.model";

@Entity({ name: 'files' })
export class FileModel extends PatternModel {

	/**
	 * Name of the folder where the file will be saved, by default the folder 
	 * will be created inside the folder with the name of the database 
	 * connection passed in the `uploadFile` method
	 */
	public path: string;
	/** 
	 * This field is used to receive the base64 file in the API, it is not 
	 * saved in the database, it will only be used in the `uploadFile` method.
	 */
	public base64?: string;

	@Column({ nullable: false }) //, enum: [FileType]
	type?: number;//FileType;

	@Column()
	content?: string;

	@Column()
	privateUrl?: string;

	@Column()
	publicUrl?: string;

	constructor(object: any = null, path: string) {
		super(object);

		this.path = path;

		// if (!Utility.isEmpty(object)) {
		// 	Object.assign(this, object);

		// 	if (Utility.isNotEmpty(object.base64)) {
		// 		this.privateUrl = '';
		// 	}
		// }
	}

	// public async validate(entityManager: EntityManager) {
	// 	super.validate(entityManager);

	// 	if (Utility.isEmpty(this.privateUrl) && Utility.isEmpty(this.privateUrl)) {
	// 		await LogUtility.saveLog(entityManager.connection.name, StatusLog.Error, StepLog.FileModel,
	// 			MessageUtility.createCustomError(`Error writing image, privateUrl and publicUrl are empty`));
	// 	}
	// }

}