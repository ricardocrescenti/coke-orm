/* eslint-disable require-jsdoc */
import { InvalidGenerateStrategyError } from '../../../errors';
import { Generate, TriggerMetadata } from '../../../metadata';
import { ColumnMetadata, ColumnOptions, ForeignKeyMetadata, IndexMetadata, EntityMetadata, UniqueMetadata } from '../../../metadata';
import { ColumnSchema, EntitySchema, ForeignKeySchema, IndexSchema, TriggerSchema, UniqueSchema } from '../../../schema';
import { QueryBuilderDriver } from '../../query-builder-driver';

export class PostgresQueryBuilderDriver extends QueryBuilderDriver {

	public generateColumnTypeSQL(columnOptions: ColumnOptions): string {
		const type: string = columnOptions.type as string;
		let mountedType = type;

		if ((this.driver.columnTypesWithLength.indexOf(type) >= 0 || this.driver.columnTypesWithPrecision.indexOf(type) >= 0) && (columnOptions.length ?? 0) > 0) {

			mountedType += '(' + columnOptions.length;
			if (this.driver.columnTypesWithPrecision.indexOf(type) >= 0) {
				mountedType += ',' + columnOptions.precision;
			}
			mountedType += ')';

		}

		return mountedType;
	}

	public generateColumnDefaultValue(columnMetadata: ColumnMetadata): string {
		if (columnMetadata.default instanceof Generate) {

			const generate: Generate = columnMetadata.default;
			switch (generate.strategy) {
				case 'sequence': return `nextval('${columnMetadata.entity.connection.options.namingStrategy?.sequenceName(columnMetadata)}'::regclass)`;
				case 'uuid': return `uuid_generate_v4()`;
				default: throw new InvalidGenerateStrategyError(columnMetadata);
			}

		}

		return columnMetadata.default;
	}

	public createUUIDExtension(): string {
		return `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
	}

	public createSequenceFromMetadata(columnMetadata: ColumnMetadata): string {
		return `CREATE SEQUENCE ${columnMetadata.entity.connection.options.namingStrategy?.sequenceName(columnMetadata)};`;
	}

	public associateSequenceFromMetadata(columnMetadata: ColumnMetadata): string {
		return `ALTER SEQUENCE "${columnMetadata.entity.connection.options.schema ?? 'public'}"."${columnMetadata.entity.connection.options.namingStrategy?.sequenceName(columnMetadata)}" OWNED BY "${columnMetadata.entity.connection.options.schema ?? 'public'}"."${columnMetadata.entity.name}"."${columnMetadata.name}";`;
	}

	public createTableFromMetadata(entityMetadata: EntityMetadata): string {
		const columns: string[] = [];
		const constraints: string[] = [];

		for (const columnName in entityMetadata.columns) {
			const column: ColumnMetadata = entityMetadata.getColumn(columnName);
			if (column.operation == 'DeletedIndicator' || column.operation == 'Virtual' || (column.relation && column.relation.type == 'OneToMany')) {
				continue;
			}

			const notNull: string = (!column.nullable ? ` NOT NULL` : '');
			const defaultValue: string = (column.default != null ? ` DEFAULT ${column.default}` : '');
			columns.push(`"${column.name}" ${this.generateColumnTypeSQL(column)}${notNull}${defaultValue}`);
		}

		if (entityMetadata.primaryKey) {
			constraints.push(this.createPrimaryKeyFromMetadata(entityMetadata, false));
		}

		for (const unique of entityMetadata.uniques) {
			constraints.push(this.createUniqueFromMetadata(unique, false));
		}

		return `CREATE TABLE "${entityMetadata.connection.options.schema ?? 'public'}"."${entityMetadata.name}" (${columns.join(', ')}${constraints.length > 0 ? `, ${constraints.join(', ')}` : ''});`;
	}

	public createColumnFromMetadata(columnMetadata: ColumnMetadata): string {
		return `ALTER TABLE "${columnMetadata.entity.connection.options.schema ?? 'public'}"."${columnMetadata.entity.name}" ADD COLUMN "${columnMetadata.name}" ${this.generateColumnTypeSQL(columnMetadata)}${!columnMetadata.nullable ? ' NOT NULL' : ''}${columnMetadata.default != null ? ` DEFAULT ${(columnMetadata.default.value ?? columnMetadata.default)}` : ''};`;
	}

	public alterColumnFromMatadata(columnMetadata: ColumnMetadata, currentColumnSchema: ColumnSchema): string[] {
		const sqls: string[] = [];
		const alterTable = `ALTER TABLE "${columnMetadata.entity.connection.options.schema ?? 'public'}"."${columnMetadata.entity.name}" ALTER`;

		if ((columnMetadata.type != currentColumnSchema.type) ||
			(columnMetadata.length != null && columnMetadata.length != currentColumnSchema.length) ||
			(columnMetadata.precision != null && columnMetadata.precision != currentColumnSchema.scale)) {

			if (columnMetadata.type != currentColumnSchema.type) {
				sqls.push(`${alterTable} "${columnMetadata.name}" TYPE ${this.generateColumnTypeSQL(columnMetadata)};`);
			}

		}

		if (columnMetadata.nullable != currentColumnSchema.nullable) {

			sqls.push(`${alterTable} COLUMN "${columnMetadata.name}" ${columnMetadata.nullable ? 'DROP' : 'SET'} NOT NULL;`);

		}

		if ((columnMetadata.default?.toString() ?? '') != currentColumnSchema.default) {

			if (currentColumnSchema.default != null && columnMetadata.default == null) {
				sqls.push(`${alterTable} COLUMN "${columnMetadata.name}" DROP DEFAULT;`);
			}
			if (columnMetadata.default != null) {
				sqls.push(`${alterTable} COLUMN "${columnMetadata.name}" SET DEFAULT ${columnMetadata.default};`);
			}

		}

		return sqls;
	}

	public createPrimaryKeyFromMetadata(entityMetadata: EntityMetadata, alterTable: boolean): string {
		const columnsName: string[] = entityMetadata.primaryKey?.columns?.map((column) => entityMetadata.columns[column].name as string) ?? [];
		const constraint: string = `CONSTRAINT "${entityMetadata.primaryKey?.name}" PRIMARY KEY("${columnsName.join('", "')}")`;

		if (alterTable) {
			return `ALTER TABLE "${entityMetadata.connection.options.schema ?? 'public'}"."${entityMetadata.name}" ADD ${constraint};`;
		}
		return constraint;
	}

	public createIndexFromMetadata(indexMetadata: IndexMetadata): string {
		const columnsName: string[] = indexMetadata.columns.map((columnPropertyName: string) => indexMetadata.entity.columns[columnPropertyName].name as string);
		return `CREATE INDEX "${indexMetadata.name}" ON "${indexMetadata.entity.connection.options.schema ?? 'public'}"."${indexMetadata.entity.name}" USING btree ("${columnsName.join('" ASC NULLS LAST, "')}" ASC NULLS LAST);`;
	}

	public createUniqueFromMetadata(uniqueMetadata: UniqueMetadata, alterTable: boolean): string {
		const columnsName: string[] = uniqueMetadata.columns.map((columnPropertyName: string) => uniqueMetadata.entity.columns[columnPropertyName].name as string);
		const constraint: string = `CONSTRAINT "${uniqueMetadata.name}" UNIQUE ("${columnsName.join('", "')}")`;

		if (alterTable) {
			return `ALTER TABLE "${uniqueMetadata.entity.connection.options.schema ?? 'public'}"."${uniqueMetadata.entity.name}" ADD ${constraint};`;
		}
		return constraint;
	}

	public createForeignKeyFromMetadata(foreignKeyMetadata: ForeignKeyMetadata): string {
		const referencedEntityMetadata: EntityMetadata = foreignKeyMetadata.getReferencedEntityMetadata();
		const referencedColumnMetadata: ColumnMetadata = foreignKeyMetadata.getReferencedColumnMetadata();

		const constraint: string = `CONSTRAINT "${foreignKeyMetadata.name}" FOREIGN KEY ("${foreignKeyMetadata.column.name}") REFERENCES "${referencedEntityMetadata.connection.options.schema ?? 'public'}"."${referencedEntityMetadata.name}" ("${referencedColumnMetadata.name}") MATCH SIMPLE ON UPDATE ${foreignKeyMetadata.onUpdate ?? 'NO ACTION'} ON DELETE ${foreignKeyMetadata.onDelete ?? 'NO ACTION'}`;
		return `ALTER TABLE "${foreignKeyMetadata.entity.connection.options.schema ?? 'public'}"."${foreignKeyMetadata.entity.name}" ADD ${constraint};`;
	}

	public createTriggerFromMetadata(triggerMetadata: TriggerMetadata): string[] {
		const variables = (triggerMetadata.trigger.variables ? `DECLARE ${triggerMetadata.trigger.variables.map((variable) => `${variable.name} ${variable.type}`).join(' ')};` : '');
		return [
			`CREATE FUNCTION "${triggerMetadata.entity.connection.options.schema ?? 'public'}"."${triggerMetadata.name}"() RETURNS trigger LANGUAGE 'plpgsql' VOLATILE AS $BODY$ ${variables} BEGIN ${triggerMetadata.trigger.code} END $BODY$;`,
			`CREATE TRIGGER "${triggerMetadata.name}" ${triggerMetadata.fires} ${triggerMetadata.events.join(' OR ')} ON "${triggerMetadata.entity.connection.options.schema ?? 'public'}"."${triggerMetadata.entity.name}" FOR EACH ROW ${triggerMetadata.trigger.when ? ` WHEN ${triggerMetadata.trigger.when} ` : ''} EXECUTE FUNCTION "${triggerMetadata.entity.connection.options.schema ?? 'public'}"."${triggerMetadata.name}"();`,
			`COMMENT ON TRIGGER "${triggerMetadata.name}" ON "${triggerMetadata.entity.connection.options.schema ?? 'public'}"."${triggerMetadata.entity.name}" IS '${triggerMetadata.hash}';`,
		];
	}

	public dropTableFromSchema(entitySchema: EntitySchema): string {
		return `DROP TABLE "${entitySchema.schema ?? 'public'}"."${entitySchema.name}" CASCADE;`;
	}

	public dropColumnFromSchema(entityMetadata: EntityMetadata, columnMetadata: ColumnSchema): string {
		return `ALTER TABLE "${entityMetadata.connection.options.schema ?? 'public'}"."${entityMetadata.name}" DROP COLUMN "${columnMetadata.name}";`;
	}

	public dropPrimaryKeyFromSchema(entityMetadata: EntityMetadata): string {
		return `ALTER TABLE "${entityMetadata.connection.options.schema ?? 'public'}"."${entityMetadata.name}" DROP CONSTRAINT "${entityMetadata.primaryKey?.name}";`;
	}

	public dropIndexFromSchema(indexSchema: IndexSchema): string {
		return `DROP INDEX "${indexSchema.name}";`;
	}

	public dropUniqueFromSchema(entityMetadata: EntityMetadata, uniqueSchema: UniqueSchema): string {
		return `ALTER TABLE "${entityMetadata.connection.options.schema ?? 'public'}"."${entityMetadata.name}" DROP CONSTRAINT "${uniqueSchema.name}";`;
	}

	public dropForeignKeyFromSchema(entityMetadata: EntityMetadata, foreignKeySchema: ForeignKeySchema): string {
		return `ALTER TABLE "${entityMetadata.connection.options.schema ?? 'public'}"."${entityMetadata.name}" DROP CONSTRAINT "${foreignKeySchema.name}";`;
	}

	public dropSequenceFromName(sequenceName: string): string {
		return `DROP SEQUENCE ${sequenceName};`;
	}

	public dropTriggerFromSchema(entityMetadata: EntityMetadata, triggerSchema: TriggerSchema): string[] {
		return [
			`DROP TRIGGER "${triggerSchema.name}" ON "${entityMetadata.connection.options.schema ?? 'public'}"."${entityMetadata.name}";`,
			`DROP FUNCTION "${entityMetadata.connection.options.schema ?? 'public'}"."${triggerSchema.name}"();`,
		];
	}

}
