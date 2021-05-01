import { QueryExecutor } from "..";
import { SimpleMap } from "../common/interfaces/map";
import { Connection } from "../connection/connection";
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from "../metadata";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { FindOptions } from "./find-options";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { SelectQueryBuilder } from "../query-builder/select-query-builder";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";
import { QueryWhere, QueryWhereColumn } from "../query-builder/types/query-where";
import { QueryJoin } from "../query-builder/types/query-join";
import { QueryColumn } from "../query-builder/types/query-column";
import { QueryOrder } from "../query-builder/types/query-order";
import { FindSelect } from "./types/find-select";
import { TableValues } from "./types/table-values";
import { CokenModel } from "./coken-model";
import { SaveOptions } from "./save-options";
import { QueryValues } from "../query-builder/types/query-values";
import { Generate } from "../metadata/add-ons/generate";

export class TableManager<T> {

   /**
    * 
    */
   public readonly tableMetadata: TableMetadata;

   /**
    * 
    */
   public get connection(): Connection {
      return this.tableMetadata.connection;
   }

   /**
    * 
    * @param tableMetadata 
    * @param queryExecutor 
    */
   constructor(tableMetadata: TableMetadata) {
      this.tableMetadata = tableMetadata;
   }

   /**
    * 
    * @param values 
    * @returns 
    */
   public create(values?: TableValues<T>): any {
      const object: T = new (this.tableMetadata.target)();
      if (values) {
         this.populate(object, values);
      }
      return object;
   }

   /**
    * 
    */
   public populate(object: any, values: any): void {
      
      /// get the properties of the object that contains the values that will
      /// be loaded into the object

      const objectKeys = Object.keys(values);

      /// get only the table columns that are in the values object to be 
      /// populated in the main object

      const columnsMetadata: ColumnMetadata[] = Object.values(this.tableMetadata.columns).filter(columnMetadata => objectKeys.indexOf(columnMetadata.propertyName) >= 0);

      /// load the values into the main object
      for (const columnMetadata of columnsMetadata) {

         if (columnMetadata.relation) {

            const relationTableMetadata: TableMetadata = this.connection.tables[columnMetadata.relation.referencedTable];
            const relationTableManager: TableManager<typeof relationTableMetadata.target> = this.connection.getTableManager(columnMetadata.relation.referencedTable);
            
            if (columnMetadata.relation.relationType == 'OneToMany') {
               object[columnMetadata.propertyName] = values[columnMetadata.propertyName].map((value: any) => relationTableManager.create(value));
            } else {
               object[columnMetadata.propertyName] = relationTableManager.create(values[columnMetadata.propertyName]);
            }

         } else {
            object[columnMetadata.propertyName] = values[columnMetadata.propertyName];
         }

      }
   }

   /**
    * 
    * @param findOptions 
    * @param tableManager 
    * @returns 
    */
   public async find(findOptions: FindOptions<T>, queryExecutor?: QueryExecutor | Connection): Promise<T[]> {
   
      // TODO - Carregar as relações com base na necessidade das condiçoes.
      // TODO - Respeitar as ordenações padrões na consulta base e nas filhas, poder passar isso pelo findOptions.
      // TODO - Ver para criar "rules" a nivel de linha, neste caso o cara pode adiconar um SQL ou uma condição JavaScript, permissões.

      /// create the query
      const query: SelectQueryBuilder<T> = this.createSelectQuery(findOptions);

      /// run the query to get the result
      const result = await query.execute(queryExecutor);

      if (result.rows.length > 0) {

         /// transformar o resultado da consulta nas suas classes específicas
         return result.rows.map((row: any) => this.create(row));
      }

      return [];
   }

   /**
    * 
    * @param findOptions 
    * @param tableManager 
    * @returns 
    */
   public async findOne(findOptions: FindOptions<T>, queryExecutor?: QueryExecutor | Connection) {
      
      const [result]: any = await this.find({ 
         ...findOptions,
         limit: 1,
         orderBy: (findOptions.orderBy ?? this.tableMetadata.primaryKey?.columns)
      }, queryExecutor);
      
      return result;
   
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(object: TableValues<T>, saveOptions?: SaveOptions): Promise<any> {
      const objectToSave: CokenModel = this.create(object);
      await objectToSave.save(saveOptions?.queryExecutor ?? this.connection, saveOptions);
      return objectToSave;
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(object: any, queryExecutor?: QueryExecutor | Connection): Promise<void> {
      const objectToDelete: CokenModel = this.create(object);
      await objectToDelete.delete(queryExecutor ?? this.connection);
   }

   /**
    * 
    * @param findOptions 
    * @param tableManager 
    * @returns 
    */
   public createSelectQuery(findOptions: FindOptions<T>): SelectQueryBuilder<T> {

      /// Obtain the list of columns to be consulted in the main table (if the 
      /// list of columns is not informed in the find options, all columns that 
      /// are unrelated will be obtained, or that the relation is in the 
      /// `relations` parameter).
      ///
      /// In the related columns, the `SelectQueryBuilder` will also be returned 
      /// to make the` left join` in the table and obtain the JSON of the table 
      /// data.
      const queryColumns: QueryColumn<T>[] = this.loadQueryColumns(findOptions.select, findOptions.relations, findOptions.roles);

      /// extract the `SelectQueryBuilder` from the related columns to generate
      /// the `left join` in the main table
      const queryJoins: QueryJoin<T>[] = this.loadQueryJoins(queryColumns);

      let orderBy: any = findOptions.orderBy;
      if (Array.isArray(findOptions.orderBy)) {

         orderBy = {};
         for (const column of findOptions.orderBy) {
            orderBy[column] = 'ASC';
         }

      }

      /// create the query to get the data
      const query = this.connection.createSelectQuery<T>(this.tableMetadata)
         .select(queryColumns)
         .join(queryJoins)
         .where(findOptions?.where)
         .orderBy(orderBy as QueryOrder<T>)
         .take(findOptions.take)
         .limit(findOptions.limit)

      return query;
   }

   /**
    * 
    * @param tableManager 
    * @returns 
    */
   public createInsertQuery(): InsertQueryBuilder<T> {
      return this.connection.createInsertQuery(this.tableMetadata);
   }

   /**
    * 
    * @param tableManager 
    * @returns 
    */
   public createUpdateQuery() : UpdateQueryBuilder<T> {
      return this.connection.createUpdateQuery(this.tableMetadata);
   }

   /**
    * 
    * @param tableManager 
    * @returns 
    */
   public createDeleteQuery(): DeleteQueryBuilder<T> {
      return this.connection.createDeleteQuery(this.tableMetadata);
   }

   /**
    * 
    * @param tableManager 
    * @param columnsToBeLoaded 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private loadQueryColumns<T>(columnsToBeLoaded?: FindSelect[], relations?: string[], roles?: string[]): QueryColumn<T>[] {

      /// If there are no columns informed to be loaded, all columns of tables 
      /// that do not have relations will be obtained, or that the relation is 
      /// in the parameter `relations`.
      if (!columnsToBeLoaded || columnsToBeLoaded.length == 0) 
      {
         columnsToBeLoaded = Object.values(this.tableMetadata.columns)
            .filter(column => column.canSelect && (!column.relation || ((relations ?? []).indexOf(column.propertyName) >= 0)))
            .map(column => column.propertyName);
      }

      /// initialize the array that will store the query columns
      const queryColumns: SimpleMap<QueryColumn<T>> = new SimpleMap();

      for (const columnStructure of columnsToBeLoaded) {

         const columnData: [string, FindSelect] = (typeof columnStructure == 'string' ? [columnStructure, []] : columnStructure) as [string, FindSelect];         
         const columnMetadata: ColumnMetadata = this.tableMetadata.columns[columnData[0]];

         if (!this.tableMetadata.columns[columnData[0]]) {
            throw new Error('Coluna inválida');
         }

         if (queryColumns[columnData[0]]) {
            throw new Error('Coluna informada em duplicidade no select');
         }

         /// 
         if ((columnMetadata.roles ?? []).length > 0 && columnMetadata.roles?.some((role => (roles?.indexOf(role) ?? 0) < 0))) {
            continue;
         }

         if (columnMetadata.relation) {

            const relationAlias: string = this.connection.options.namingStrategy?.eagerJoinRelationAlias(columnMetadata) as string;
            const relationTableManager: TableManager<any> =  this.connection.getTableManager(columnMetadata.relation.referencedTable);
            const relationQuery: SelectQueryBuilder<any> = relationTableManager.createSelectQuery({
               select: (columnData.length > 1 ? columnData[1] as [string, FindSelect] : []),
               relations: (relations ?? [])
                  .filter(relation => relation.startsWith(`${columnMetadata.name}.`))
                  .map(relation => relation.substring(relation.indexOf('.') + 1, relation.length)),
               roles: roles
            });

               if (columnMetadata.relation.relationType == 'OneToMany') {

                  const referencedColumn: ColumnMetadata = relationTableManager.tableMetadata.columns[columnMetadata.relation.referencedColumn];
                  const relationQuery: SelectQueryBuilder<any> = this.createChildSubquery(columnMetadata, columnData, relationTableManager, relations, roles);

                  queryColumns[columnData[0]] = {
                     table: relationAlias,
                     column: columnMetadata.propertyName,
                     relation: new QueryJoin<any>({
                        type: 'left',
                        table: relationQuery,
                        alias: relationAlias,
                        condition: `"${relationAlias}"."${referencedColumn.name}" = "${this.tableMetadata.className}"."${referencedColumn.relation?.referencedColumn}"`
                     }),
                  }

               } else {

                  const relationQuery: SelectQueryBuilder<any> = this.createParentSubquery(columnMetadata, columnData, relationTableManager, relations, roles);

                  queryColumns[columnData[0]] = {
                     table: relationAlias,
                     column: columnMetadata.propertyName,
                     relation: new QueryJoin<any>({
                        type: 'left',
                        table: relationQuery,
                        alias: relationAlias,
                        condition: `"${relationAlias}"."${columnMetadata.relation.referencedColumn}" = "${this.tableMetadata.className}"."${columnMetadata.name}"`
                     }),
                  }

               }

         } else {

            queryColumns[columnData[0]] = {
               table: this.tableMetadata.className,
               column: columnMetadata.name as string,
               alias: columnMetadata.propertyName
            }

         }
      }      
      
      return Object.values(queryColumns);
   }

   /**
    * 
    * @param columnMetadata 
    * @param columnData 
    * @param relationTableManager 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private createSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationTableManager: TableManager<T>, relations?: string[], roles?: string[]): SelectQueryBuilder<T> {
      const relationQuery: SelectQueryBuilder<T> = relationTableManager.createSelectQuery({
         select: (columnData.length > 1 ? columnData[1] as [string, FindSelect] : []),
         relations: (relations ?? [])
            .filter(relation => relation.startsWith(`${columnMetadata.name}.`))
            .map(relation => relation.substring(relation.indexOf('.') + 1, relation.length)),
         roles: roles
      });

      return relationQuery;
   }

   /**
    * 
    * @param columnMetadata 
    * @param columnData 
    * @param relationTableManager 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private createChildSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationTableManager: TableManager<T>, relations?: string[], roles?: string[]): SelectQueryBuilder<T> {
      const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationTableManager, relations, roles);

      relationQuery.select([
         {
            table: relationTableManager.tableMetadata.className,
            column: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].name as string,
            alias: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].name as string
         },
         {
            column: {
               jsonColumn: {
                  jsonColumns: relationQuery.queryManager.columns as QueryColumn<any>[],
               }
            },
            alias: columnMetadata.propertyName
         }
      ]);

      relationQuery.groupBy({
         table: relationTableManager.tableMetadata.className,
         column: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].name as string
      });

      return relationQuery;
   }

   /**
    * 
    * @param columnMetadata 
    * @param columnData 
    * @param relationTableManager 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private createParentSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationTableManager: TableManager<T>, relations?: string[], roles?: string[]): SelectQueryBuilder<T> {
      const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationTableManager, relations, roles);

      relationQuery.select([
         {
            table: relationTableManager.tableMetadata.className,
            column: columnMetadata.relation?.referencedColumn as string,
            alias: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName
         },
         {
            column: {
               jsonColumns: relationQuery.queryManager.columns as QueryColumn<any>[],
            },
            alias: columnMetadata.propertyName
         }
      ]);

      return relationQuery;
   }

   /**
    * 
    * @param queryColumns 
    * @returns 
    */
   public loadQueryJoins(queryColumns: QueryColumn<T>[]): QueryJoin<T>[] {

      return queryColumns
         .filter((queryColumn) => queryColumn.relation)
         .map((queryColumn) => {

            return {
               type: 'left',
               table: queryColumn.relation?.table,
               alias: queryColumn?.relation?.alias,
               condition: queryColumn?.relation?.condition
            } as QueryJoin<T>

         });

   }

   /**
    * 
    * @param values 
    */
   public getObjectValues(values: QueryValues<T>, useDatabaseNames: boolean, columns?: string[]): any {
      if (!values) {
         return;
      }

      const object: any = {};
      for (const key of Object.keys(values)) {

         if (columns && columns.indexOf(key) < 0) {
            continue;
         }

         const columnMetadata: ColumnMetadata = this.tableMetadata.columns[key];
         if (!columnMetadata || (columnMetadata.relation && columnMetadata.relation?.relationType == 'OneToMany')) {
            continue;
         }

         const value: any = (values as any)[key];
         const columnName: string = (useDatabaseNames ? columnMetadata.name as string : columnMetadata.propertyName);

         if (value instanceof Object && columnMetadata.relation && columnMetadata.relation.relationType != 'OneToMany') {
            object[columnName] = value[columnMetadata.relation.referencedColumn];
         } else {
            object[columnName] = value;
         }
      }

      return object;
   }

   /**
    * 
    * @param values 
    */
   // public setDefaultValues(values: QueryValues<T>): void {

   //    const keys: string[] = Object.keys(values);
   //    for (const columnMetadata of Object.values(this.tableMetadata.columns)) {

   //       if (columnMetadata.default && !(columnMetadata.default instanceof Generate) && keys.indexOf(columnMetadata.propertyName) < 0) {
   //          (values as any)[columnMetadata.propertyName] = columnMetadata.default;
   //       }

   //    }

   // }

   /**
    * 
    * @param object 
    * @returns 
    */
   public createWhereFromColumns(values: any, columns: string[]): QueryWhere<T> | undefined {

      const valuesKeys: string[] = Object.keys(values);

      if (valuesKeys.length == 0) {
         return undefined;
      }

      const where: QueryWhereColumn<any> = {};
      for (const column of columns) {

         if (valuesKeys.indexOf(column) < 0) {
            return undefined;
         }

         const columnMetadata: ColumnMetadata = this.tableMetadata.columns[column];
         if (!columnMetadata) {
            throw Error('Coluna inválida para criação do Where')
         }

         where[columnMetadata.name as string] = (values[column] == null 
            ? { isNull: true }
            : values[column]);

      }

      return where;

   }
}