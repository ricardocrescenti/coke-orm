import { ForeignKeyAction } from "./foreign-key-action";
import { ForeignKeyType } from "./foreign-key-type";

export type ObjectType<T> = { new (): T }|Function;

/**
 * Describes all relation's options.
 */
export class ForeignKeyOptions {
   
    /**
     * Class referenced to this table.
     */
    public readonly target: any;

    /**
     * 
     */
    public readonly name?: string;

    /**
     * 
     */
    public readonly relationType: ForeignKeyType;

    /**
     * Class referenced to this field
     */
    public readonly referencedTable: string;

    /**
     * Name of the class field referenced to this field
     */
    public readonly referencedColumn: string

    /**
     * Sets cascades options for the given relation.
     * If set to true then it means that related object can be allowed to be inserted or updated in the database.
     * You can separately restrict cascades to insertion or updation using following syntax:
     *
     * cascade: ["insert", "update", "remove", "soft-remove", "recover"] // include or exclude one of them
     */
    public readonly cascade?: ('insert'|'update'|'remove')[];

    /**
     * Indicates if relation column value can be nullable or not.
     */
    public readonly nullable?: boolean;

    /**
     * Database cascade action on delete.
     */
    public readonly onDelete?: ForeignKeyAction;

    /**
     * Database cascade action on update.
     */
    public readonly onUpdate?: ForeignKeyAction;

    /**
     * Set this relation to be lazy. Note: lazy relations are promises. When you call them they return promise
     * which resolve relation result then. If your property's type is Promise then this relation is set to lazy automatically.
     */
    public readonly lazy?: boolean;

    /**
     * Set this relation to be eager.
     * Eager relations are always loaded automatically when relation's owner entity is loaded using find* methods.
     * Only using QueryBuilder prevents loading eager relations.
     * Eager flag cannot be set from both sides of relation - you can eager load only one side of the relationship.
     */
    public readonly eager?: boolean;

    constructor(options: ForeignKeyOptions) {
        this.target = options.target;
        this.name = options.name;
        this.relationType = options.relationType;
        this.referencedTable = options.referencedTable;
        this.referencedColumn = options.referencedColumn;
        this.cascade = options.cascade;
        this.nullable = options.nullable ?? false;
        this.onDelete = options.onDelete ?? 'NO ACTION';
        this.onUpdate = options.onUpdate ?? 'NO ACTION';
        this.lazy = options.lazy ?? false;
        this.eager = options.eager ?? false;
    }
}
