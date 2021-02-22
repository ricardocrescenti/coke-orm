export type ObjectType<T> = { new (): T }|Function;

/**
 * Describes all relation's options.
 */
export class RelationOptions<T> {

    /**
     * 
     */
    public readonly relationType: "oneToMany"|"manyToOne"|"OneToOne";

    /**
     * Class referenced to this field
     */
    public readonly target: ObjectType<T> | string;

    /**
     * Name of the class field referenced to this field
     */
    public readonly targetColumnName: string

    /**
     * Sets cascades options for the given relation.
     * If set to true then it means that related object can be allowed to be inserted or updated in the database.
     * You can separately restrict cascades to insertion or updation using following syntax:
     *
     * cascade: ["insert", "update", "remove", "soft-remove", "recover"] // include or exclude one of them
     */
    public readonly cascade: boolean|("insert"|"update"|"remove")[];

    /**
     * Indicates if relation column value can be nullable or not.
     */
    public readonly nullable?: boolean;

    /**
     * Database cascade action on delete.
     */
    public readonly onDelete: ("restrict"|"cascade"|"setnull");

    /**
     * Database cascade action on update.
     */
    public readonly onUpdate: ("restrict"|"cascade"|"setnull");

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

    constructor(options: RelationOptions<T>) {
        this.relationType = options.relationType;
        this.target = options.target;
        this.targetColumnName = options.targetColumnName;
        this.cascade = options.cascade;
        this.nullable = options.nullable ?? false;
        this.onDelete = options.onDelete;
        this.onUpdate = options.onUpdate;
        this.lazy = options.lazy ?? false;
        this.eager = options.eager ?? false;
    }
}
