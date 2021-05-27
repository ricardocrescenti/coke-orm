import { QueryExecutor } from "..";
import { SimpleMap } from "../common/interfaces/map";
import { Connection } from "../connection/connection";
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from "../metadata";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { FindOptions } from "./options/find-options";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { SelectQueryBuilder } from "../query-builder/select-query-builder";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";
import { QueryWhere, QueryWhereColumn } from "../query-builder/types/query-where";
import { QueryJoin } from "../query-builder/column-builder/query-relation-builder";
import { FindSelect } from "./types/find-select";
import { TableValues } from "./types/table-values";
import { CokeModel } from "./coke-model";
import { SaveOptions } from "./options/save-options";
import { StringUtils } from "../utils/string-utils";
import { OrmUtils } from "../utils/orm-utils";
import { QueryColumnBuilder } from "../query-builder/column-builder/query-column-builder";
import { QueryDatabaseColumnBuilder } from "../query-builder/column-builder/query-database-column-builder";
import { QueryJsonAggColumnBuilder } from "../query-builder/column-builder/query-json-agg-column-builder";
import { QueryJsonColumnBuilder } from "../query-builder/column-builder/query-json-column-builder";
import { QueryWhereColumnBuilder } from "../query-builder/column-builder/query-where-column-builder";
import { QueryAggregateColumnBuilder } from "../query-builder/column-builder/query-aggregate-column-builder";

export class TableManager<T> {

   /**
    * 
    */
   public get connection(): Connection {
      return this.tableMetadata.connection;
   }

   /**
    * 
    */
   public readonly tableMetadata: TableMetadata;

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
      if (values == null) {
         return null;
      }

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
            
            if (columnMetadata.relation.type == 'OneToMany') {
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
   public async find(findOptions?: FindOptions<T>, queryExecutor?: QueryExecutor | Connection): Promise<T[]> {

      /// create the query
      const query: SelectQueryBuilder<T> = this.createSelectQuery(findOptions, 0);

      /// run the query to get the result
      const result = await query.execute(queryExecutor);

      if (result.rows.length > 0) {

         /// transform the query result into its specific classes
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
   public async findOne(findOptions: FindOptions<T>, queryExecutor?: QueryExecutor | Connection): Promise<T> {
      
      const [result]: any = await this.find({ 
         ...findOptions,
         limit: 1,
         orderBy: (findOptions.orderBy ?? this.tableMetadata.orderBy)
      }, queryExecutor);
      
      return result;
   
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(object: TableValues<T>, saveOptions?: SaveOptions): Promise<any> {
      const objectToSave: CokeModel = this.create(object);
      return objectToSave.save(saveOptions?.queryExecutor ?? this.connection, saveOptions);
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(object: any, queryExecutor?: QueryExecutor | Connection): Promise<boolean> {
      const objectToDelete: CokeModel = this.create(object);
      return objectToDelete.delete(queryExecutor ?? this.connection);
   }

   /**
    * 
    * @param findOptions 
    * @param tableManager 
    * @returns 
    */
   public createSelectQuery(findOptions?: FindOptions<T>, level?: number, relationMetadata?: ForeignKeyMetadata): SelectQueryBuilder<T> {

      /// create a copy of findOptions to not modify the original and help to 
      /// copy it with the standard data needed to find the records
      findOptions = new FindOptions(findOptions);
      FindOptions.loadDefaultOrderBy(this.tableMetadata, findOptions);

      /// obtain the list of columns to be consulted in the main table (if the 
      /// list of columns is not informed in the find options, all columns that 
      /// are unrelated will be obtained, or that the relation is in the 
      /// `relations` parameter).
      ///
      /// In the related columns, the `SelectQueryBuilder` will also be returned 
      /// to make the` left join` in the table and obtain the JSON of the table 
      /// data.
      const queryColumns: QueryColumnBuilder<T>[] = this.loadQueryColumns(findOptions, level ?? 0);

      /// extract the `SelectQueryBuilder` from the related columns to generate
      /// the `left join` in the main table
      const queryJoins: QueryJoin<T>[] = this.loadQueryJoins(queryColumns);

      /// if the table has a column with 'DeletedAt' operation, a filter will be 
      /// added to 'findOptions.where' so as not to get the deleted rows
      const deletedAtColumnMetadata: ColumnMetadata | null = this.tableMetadata.getDeletedAtColumn();
      if (deletedAtColumnMetadata) {
         
         if (!findOptions.where) {
            findOptions.where = {};
         }

         const deletedAtWhere: any = {};
         deletedAtWhere[deletedAtColumnMetadata.propertyName] = { isNull: true };

         if (Array.isArray(findOptions.where)) {
         
            findOptions.where = {
               ...deletedAtWhere,
               AND: findOptions.where
            }
            
         } else {
            
            Object.assign(findOptions.where, deletedAtWhere);
         
         }
      
      }

      /// create the query to get the data
      const query: SelectQueryBuilder<T> = this.connection.createSelectQuery<T>(this.tableMetadata)
         .level(level ?? 0)
         .select(queryColumns)
         .join(queryJoins)
         //.virtualDeletionColumn(this.tableMetadata.getDeletedAtColumn()?.name)
         .where(findOptions.where)
         .orderBy(findOptions.orderBy)
         .take(findOptions.take)
         .limit(findOptions.limit)

      if ((level ?? 0) > 0) {
         query.where();
      }
      
      return query;
   
   }

   /**
    * 
    * @param tableManager 
    * @returns 
    */
   public createInsertQuery(): InsertQueryBuilder<T> {
      return this.connection.createInsertQuery<T>(this.tableMetadata);
   }

   /**
    * 
    * @param tableManager 
    * @returns 
    */
   public createUpdateQuery() : UpdateQueryBuilder<T> {
      const query: UpdateQueryBuilder<T> = this.connection.createUpdateQuery<T>(this.tableMetadata)
         //.virtualDeletionColumn(this.tableMetadata.getDeletedAtColumn()?.name);
      return query;      
   }

   /**
    * 
    * @param tableManager 
    * @returns 
    */
   public createDeleteQuery(): DeleteQueryBuilder<T> {
      const query: DeleteQueryBuilder<T> = this.connection.createDeleteQuery<T>(this.tableMetadata)
         //.virtualDeletionColumn(this.tableMetadata.getDeletedAtColumn()?.name);
      return query;
   }

   /**
    * 
    * @param tableManager 
    * @param columnsToBeLoaded 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private loadQueryColumns<T>(findOptions: FindOptions<T>, level: number): QueryColumnBuilder<T>[] {

      /// If there are no columns informed to be loaded, all columns of tables 
      /// that do not have relations will be obtained, or that the relation is 
      /// in the parameter `relations`.
      if (!findOptions.select || findOptions.select.length == 0) 
      {
         findOptions.select = Object.values(this.tableMetadata.columns)
            .filter(column => column.canSelect && (!column.relation || (column.relation.eager || (findOptions.relations ?? []).indexOf(column.propertyName) >= 0)))
            .map(column => column.propertyName);
      }

      /// initialize the array that will store the query columns
      const queryColumns: SimpleMap<QueryColumnBuilder<T>> = new SimpleMap();

      for (const columnStructure of findOptions.select) {

         const columnData: [string, FindSelect] = (typeof columnStructure == 'string' ? [columnStructure, []] : columnStructure) as [string, FindSelect];         
         const columnMetadata: ColumnMetadata = this.tableMetadata.columns[columnData[0]];

         if (!this.tableMetadata.columns[columnData[0]]) {
            throw new Error('Coluna inválida');
         }

         if (queryColumns[columnData[0]]) {
            throw new Error('Coluna informada em duplicidade no select');
         }

         /// If the column has roles restrictions, it will only appear in the 
         /// query result if the role is informed in the findOptions.roles
         if ((columnMetadata.roles ?? []).length > 0 && columnMetadata.roles?.some((role => (findOptions.roles?.indexOf(role) ?? 0) < 0))) {
            continue;
         }

         if (columnMetadata.relation) {

            const relationAlias: string = this.connection.options.namingStrategy?.eagerJoinRelationAlias(columnMetadata) as string;
            const relationTableManager: TableManager<any> =  this.connection.getTableManager(columnMetadata.relation.referencedTable);

            if (columnMetadata.relation.type == 'OneToMany') {

               const referencedColumn: ColumnMetadata = relationTableManager.tableMetadata.columns[columnMetadata.relation.referencedColumn];
               const relationQuery: SelectQueryBuilder<any> = this.createChildSubquery(columnMetadata, columnData, relationTableManager, findOptions, level + 1);

               queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
                  table: relationAlias,
                  column: columnMetadata.propertyName,
                  alias: columnMetadata.propertyName,
                  relation: new QueryJoin<any>({
                     type: 'left',
                     table: relationQuery,
                     alias: relationAlias,
                     condition: `"${relationAlias}"."${referencedColumn.propertyName}" = "${this.tableMetadata.className}"."${referencedColumn.relation?.referencedColumn}"`
                  }),
               });

            } else {

               const relationQuery: SelectQueryBuilder<any> = this.createParentSubquery(columnMetadata, columnData, relationTableManager, findOptions, level + 1);

               queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
                  table: relationAlias,
                  column: columnMetadata.propertyName,
                  alias: columnMetadata.propertyName,
                  relation: new QueryJoin<any>({
                     type: ((findOptions.where as any ?? {})[columnMetadata.propertyName] ? 'inner' : 'left'),
                     table: relationQuery,
                     alias: relationAlias,
                     condition: `"${relationAlias}"."${columnMetadata.relation.referencedColumn}" = "${this.tableMetadata.className}"."${columnMetadata.name}"`
                  }),
               });

            }

         } else {

            queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
               table: this.tableMetadata.className,
               column: columnMetadata.propertyName,
               alias: columnMetadata.propertyName
            });

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
   private createSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationTableManager: TableManager<T>, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
      
      const subqueryRelations = (findOptions.relations ?? [])
         .filter(relation => relation.startsWith(`${columnMetadata.propertyName}.`))
         .map(relation => relation.substring(relation.indexOf('.') + 1, relation.length));

      const queryWhereColumns: QueryWhereColumnBuilder<T>[] = [];
      if (OrmUtils.isNotEmpty(findOptions.where)) {

         let subqueryWhere: any[] = [];
         if (!Array.isArray(findOptions.where)) {
            subqueryWhere = [findOptions.where];
         } else {
            subqueryWhere = findOptions.where;
         }

         for (let i = 0; i < subqueryWhere.length; i++) {
            
            const where: any = subqueryWhere[i];
            if (OrmUtils.isNotEmpty(where[columnMetadata.propertyName])) {
            
               const sha1Where: string = StringUtils.sha1(JSON.stringify(where[columnMetadata.propertyName]));
               if (queryWhereColumns.filter(column => column.alias == sha1Where).length == 0) { 

                  queryWhereColumns.push(new QueryWhereColumnBuilder({
                     where: where[columnMetadata.propertyName],
                     alias: sha1Where
                  }))

               }

               subqueryWhere[i][`${columnMetadata.propertyName}_${columnMetadata.relation?.referencedTable}.${sha1Where}`] = { equal: true };
               delete where[columnMetadata.propertyName];
            
            }

         }

      }

      const subqueryOrderBy: any = (findOptions.orderBy as any ?? {})[columnMetadata.propertyName];

      const relationQuery: SelectQueryBuilder<T> = relationTableManager.createSelectQuery({
         select: (columnData.length > 1 ? columnData[1] as [string, FindSelect] : []),
         relations: subqueryRelations,
         where: queryWhereColumns.map(queryWhereColumn => queryWhereColumn.where),
         orderBy: subqueryOrderBy,
         roles: findOptions.roles
      }, level, columnMetadata.relation);

      if (OrmUtils.isNotEmpty(queryWhereColumns)) {
         relationQuery.select([
            ...(relationQuery.queryManager.columns ?? []),
            ...queryWhereColumns.map(queryWhereColumn => new QueryWhereColumnBuilder({
               where: queryWhereColumn.where,
               alias: queryWhereColumn.alias
            }))
         ]);
      }

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
   private createChildSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationTableManager: TableManager<T>, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
      const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationTableManager, findOptions, level);

      relationQuery.select([
         new QueryDatabaseColumnBuilder({
            table: relationTableManager.tableMetadata.className,
            column: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName as string,
            alias: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName as string
         }),
         new QueryJsonAggColumnBuilder({
            jsonColumn: new QueryJsonColumnBuilder({
               jsonColumns: (relationQuery.queryManager.columns as QueryColumnBuilder<any>[]).filter((column) => !(column instanceof QueryWhereColumnBuilder)),
               alias: columnMetadata.propertyName
            }),
            orderBy: relationQuery.queryManager.orderBy,
            alias: columnMetadata.propertyName
         }),
         ...(relationQuery.queryManager.columns as QueryColumnBuilder<any>[])
            .filter((column) => column instanceof QueryWhereColumnBuilder)
            .map((column) => new QueryAggregateColumnBuilder({
               type: 'max',
               column: new QueryWhereColumnBuilder({
                  ...column as any,
                  cast: 'int'
               }),
               cast: 'boolean',
               alias: column.alias
            }))
      ]);

      relationQuery.groupBy(new QueryDatabaseColumnBuilder({
         table: relationTableManager.tableMetadata.className,
         column: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName,
         alias: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName
      }));

      /// remove o order by pois ele foi adicionado dentro do SelectJsonAgg
      relationQuery.orderBy();

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
   private createParentSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationTableManager: TableManager<T>, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
      const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationTableManager, findOptions, level);

      relationQuery.select([
         new QueryDatabaseColumnBuilder({
            table: relationTableManager.tableMetadata.className,
            column: columnMetadata.relation?.referencedColumn as string,
            alias: relationTableManager.tableMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName
         }),
         new QueryJsonColumnBuilder({
            jsonColumns: (relationQuery.queryManager.columns as QueryColumnBuilder<any>[]).filter((column) => !(column instanceof QueryWhereColumnBuilder)),
            alias: columnMetadata.propertyName
         }),
         ...(relationQuery.queryManager.columns as QueryColumnBuilder<any>[])
            .filter((column) => column instanceof QueryWhereColumnBuilder)
      ]);

      return relationQuery;
   }

   /**
    * 
    * @param queryColumns 
    * @returns 
    */
   private loadQueryJoins(queryColumns: QueryColumnBuilder<T>[]): QueryJoin<T>[] {

      return queryColumns
         .filter((queryColumn) => queryColumn instanceof QueryDatabaseColumnBuilder && queryColumn.relation)
         .map((queryColumn) => {

            return new QueryJoin<T>({
               type: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.type,
               table: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.table,
               alias: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.alias,
               condition: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.condition
            } as any)

         });

   }

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

         let value: any = (values as any)[column];
         if (value instanceof Object && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany') {
            value = value[columnMetadata.relation.referencedColumn];
         }

         where[columnMetadata.name as string] = (value == null 
            ? { isNull: true }
            : value);

      }

      return where;

   }
}