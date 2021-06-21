import { ColumnSchema } from './column-schema';
import { SimpleMap } from '../common';
import { ForeignKeySchema } from './foreign-key-schema';
import { IndexSchema } from './index-schema';
import { UniqueSchema } from './unique-schema';
import { PrimaryKeySchema } from './primary-key-schema';
import { TriggerSchema } from './trigger-schema';

/**
 * Class that represents the structure of the current table in the database.
 */
export class EntitySchema {

	public readonly schema: string;
	public readonly name: string;
	public readonly columns: SimpleMap<ColumnSchema>;
	public readonly primaryKey?: PrimaryKeySchema;
	public readonly foreignKeys: SimpleMap<ForeignKeySchema>;
	public readonly uniques: SimpleMap<UniqueSchema>;
	public readonly indexs: SimpleMap<IndexSchema>;
	public readonly triggers: SimpleMap<TriggerSchema>;

	/**
	 * Default class constructor;
	 * @param {EntitySchema} entity Table data.
	 */
	constructor(entity: Omit<EntitySchema, 'primaryKey' | 'foreignKeys' | 'indexs' | 'uniques'>) {
		this.schema = entity.schema;
		this.name = entity.name;
		this.columns = entity.columns;
		this.foreignKeys = new SimpleMap<ForeignKeySchema>();
		this.uniques = new SimpleMap<UniqueSchema>();
		this.indexs = new SimpleMap<IndexSchema>();
		this.triggers = entity.triggers ?? new SimpleMap<TriggerSchema>();

		for (const columnName in this.columns) {
			const column = this.columns[columnName];

			if (column.primaryKey && !this.primaryKey) {
				this.primaryKey = column.primaryKey;
			}

			for (const foreignKeyName in column.foreignKeys ?? []) {
				if (!this.foreignKeys[foreignKeyName]) {
					this.foreignKeys[foreignKeyName] = column.foreignKeys[foreignKeyName];
				}
			}

			for (const uniqueName in column.uniques ?? []) {
				if (!this.uniques[uniqueName]) {
					this.uniques[uniqueName] = column.uniques[uniqueName];
				}
			}

			for (const indexName in column.indexs ?? []) {
				if (!this.indexs[indexName]) {
					this.indexs[indexName] = column.indexs[indexName];
				}
			}

		}
	}

}
