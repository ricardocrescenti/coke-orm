import { Column, Entity, VirtualColumn } from "../../../decorators";
import { PatternModel } from "../pattern.model";

@Entity({ name: 'files' })
export class FileModel extends PatternModel {

	/**
	 * Name of the folder where the file will be saved, by default the folder 
	 * will be created inside the folder with the name of the database 
	 * connection passed in the `uploadFile` method
	 */
	@VirtualColumn({ canPopulate: false })
	public path?: string = 'batatinha';
	/** 
	 * This field is used to receive the base64 file in the API, it is not 
	 * saved in the database, it will only be used in the `uploadFile` method.
	 */
	 @VirtualColumn()
	public base64?: string;

	@Column({ nullable: false }) //, enum: [FileType]
	type?: number;//FileType;

	@Column({ nullable: true, default: 1 })
	content?: string;

	@Column()
	privateUrl?: string;

	@Column()
	publicUrl?: string;

}