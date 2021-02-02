import { ColumnSchema } from "../../schema/column-schema";
import { ConstraintSchema } from "../../schema/constraint-schema";
import { Map } from "../../common/interfaces/map";
import { Schema } from "../../schema/schema";
import { PostgresDriver } from "./postgres-driver";
import { TableSchema } from "../../schema/table-schema";

/**
 * https://www.postgresql.org/docs/9.1/information-schema.html
 * 
 * SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public'
 * SELECT * FROM "information_schema"."columns" WHERE "table_schema" = 'public'
 * SELECT * FROM "information_schema"."table_constraints" WHERE "constraint_schema" = 'public'
 * SELECT * FROM "information_schema"."constraint_column_usage" WHERE "constraint_schema" = 'public'
 * SELECT * FROM "information_schema"."constraint_table_usage" WHERE "constraint_schema" = 'public'
 * SELECT * FROM "information_schema"."triggers" WHERE "trigger_schema" = 'public'
 * SELECT * FROM "information_schema"."views" WHERE "table_schema" = 'public'
 * SELECT * FROM "information_schema"."sequences" WHERE "sequence_schema" = 'public'
 * SELECT * FROM "information_schema"."schemata" WHERE "schema_name" = 'public'
 */
export class PostgresSchema extends Schema {

   constructor(driver: PostgresDriver) {
      super(driver);
   }

   public async load(): Promise<void> {
      const informationSchema = await this.driver.executeQuery(`
         SELECT t.table_name, c.column_name, c.ordinal_position, c.column_default, c.is_nullable, c.data_type, c.numeric_precision, c.numeric_scale, c.constraint_name, c.constraint_type
         FROM information_schema.tables t
         LEFT JOIN (SELECT c.table_schema, c.table_name, c.column_name, c.ordinal_position, c.column_default, c.is_nullable, c.data_type, c.numeric_precision, c.numeric_scale, ccu.constraint_name, ccu.constraint_type
               FROM information_schema.columns c
               LEFT JOIN (SELECT ccu.table_schema, ccu.table_name, ccu.column_name, ccu.constraint_name, tc.constraint_type
                  FROM information_schema.constraint_column_usage ccu
                  INNER JOIN information_schema.table_constraints  tc on (tc.table_schema = ccu.table_schema and tc.table_name = ccu.table_name and tc.constraint_name = ccu.constraint_name)
                  ORDER BY ccu.table_schema, ccu.table_name, ccu.column_name) ccu on (ccu.table_schema = c.table_schema and ccu.table_name = c.table_name and ccu.column_name = c.column_name)
               ORDER BY c.table_schema, c.table_name, c.column_name, ccu.constraint_name) c on (c.table_schema = t.table_schema and c.table_name = t.table_name)
         WHERE t.table_schema = 'public'
         ORDER BY t.table_name, c.ordinal_position, c.column_name`);

         if (informationSchema.rows.length > 0) {
            let tableName: string = '';
            let columnName: string = '';
            let columns: Map<ColumnSchema> = {};
            let constraintName: string = '';
            let constraints: Map<ConstraintSchema> = {};
            
            for (let index = 0; index <= informationSchema.rows.length; index++) {
               const info = (index < informationSchema.rows.length ? informationSchema.rows[index] : null);

               if (tableName != info?.table_name) {

                  if (tableName != '') {
                     this.tables[tableName] = new TableSchema({
                        name: tableName, 
                        columns: columns, 
                        constraints: constraints
                     });
                  }

                  if (!info) {
                     break;
                  }

                  tableName = info.table_name;
                  columns = {};
                  constraints = {};
               }

               if (columnName != info.column_name) {
                  columns[info.column_name] = new ColumnSchema({
                     name: info.column_name,
                     position: info.ordinal_position,
                     defaultValue: info.column_default,
                     isNullable: info.is_nullable,
                     type: info.data_type,
                     length: info.numeric_precision,
                     scale: info.numeric_scale,
                  });

                  columnName = info.column_name;
               }

               if (info.constraint_name && constraintName != info.constraint_name) {
                  constraints[info.constraint_name] = new ConstraintSchema({
                     name: info.constraint_name,
                     type: info.constraint_type
                  });

                  constraints[info.constraint_name].columns[info.column_name] = columns[info.column_name];
                  columns[info.column_name].constraints[info.constraint_name] = constraints[info.constraint_name];
               }

            }
         }

      // const tables = await this.driver.executeQuery(`
      //    SELECT t.table_name, c.columns
      //    FROM information_schema.tables t
      //    LEFT JOIN 
      //       (
      //          SELECT c.table_schema, c.table_name, json_agg(json_build_object('name', c.column_name, 'position', c.ordinal_position, 'isDefault', c.column_default, 'nullable', c.is_nullable, 'type', c.data_type, 'length', c.numeric_precision, 'scale', c.numeric_scale, 'constraints', ccu.constraints) order by c.ordinal_position, c.column_name) as columns
      //          FROM information_schema.columns c
      //          LEFT JOIN (
      //             SELECT ccu.table_schema, ccu.table_name, ccu.column_name, json_agg(json_build_object('name', ccu.constraint_name, 'type', tc.constraint_type)) as constraints
      //             FROM information_schema.constraint_column_usage ccu
      //             INNER JOIN information_schema.table_constraints  tc on (tc.table_schema = ccu.table_schema and tc.table_name = ccu.table_name and tc.constraint_name = ccu.constraint_name)
      //             GROUP BY ccu.table_schema, ccu.table_name, ccu.column_name) ccu on (ccu.table_schema = c.table_schema and ccu.table_name = c.table_name and ccu.column_name = c.column_name)
      //          GROUP BY c.table_schema, c.table_name
      //       ) c on (
      //          c.table_schema = t.table_schema and 
      //          c.table_name = t.table_name)
      //    WHERE t.table_schema = 'public'
      //    ORDER BY t.table_name`);

      // for (const table of tables) {
      //    const columns: Map<ColumnSchema> = {};
      //    const constraints: Map<ConstraintSchema> = {};

      //    for (const column of table.columns) {
      //       columns[column.name] = new ColumnSchema(column);

      //       for (const constraint of column.constraints) {
      //          if (!constraints[constraint.name]) {
      //             constraints[constraint.name] = new ConstraintSchema(constraint);
      //          }

      //          constraints[constraint.name].columns[column.name] = columns[column.name];
      //          columns[column.name].constraints[constraint.name] = constraints[constraint.name];
      //       }
      //    }
         
      //    this.tables[table.name] = new TableSchema(table.name, columns, constraints);
      // }
   }

}