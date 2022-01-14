import { ForeignKeyAction } from './foreign-key-action';
import { ForeignKeyType } from './foreign-key-type';

/**
 * Describes all relation's options.
 */
export class ForeignKeyOptions<T = any> {

	/**
	 * Class referenced to this entity.
	 */
	public readonly target: any;

	/**
	 * Foreign Key name
	 */
	public readonly name?: string;

	/**
	 * Foreign Key type
	 */
	public readonly type: ForeignKeyType;

	/**
	 * Class referenced to this field
	 */
	public readonly referencedEntity: string;

	/**
	 * Name of the class field referenced to this field
	 */
	public readonly referencedColumn: string

	/**
	 * Sets cascades options for the given relation.
	 */
	public readonly cascade?: ('insert'|'update'|'remove')[];

	/**
	 * Database cascade action on delete.
	 */
	public readonly onDelete?: ForeignKeyAction;

	/**
	 * Database cascade action on update.
	 */
	public readonly onUpdate?: ForeignKeyAction;

	/**
	 * Indicates if this relationship is automatically loaded when finding it,
	 * otherwise it must be entered in the FindOptions 'relation' property.
	 */
	public readonly eager?: boolean;

	/**
	 * Default class constructor.
	 * @param {ForeignKeyOptions} options Foreign Key Options.
	 */
	constructor(options: ForeignKeyOptions<T>) {
		this.target = options.target;
		this.name = options.name;
		this.type = options.type;
		this.referencedEntity = options.referencedEntity;
		this.referencedColumn = options.referencedColumn;
		this.cascade = options.cascade;
		this.onDelete = options.onDelete ?? 'NO ACTION';
		this.onUpdate = options.onUpdate ?? 'NO ACTION';
		this.eager = options.eager ?? false;
	}
}
