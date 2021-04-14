import { QueryExecutor } from "..";
import { SimpleMap } from "../common/interfaces/map";
import { Connection } from "../connection/connection";
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from "../metadata";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { FindOptions, FindSelect } from "../query-builder/find-options";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { QueryColumn, QueryJoin, QueryOrder, QueryWhere } from "../query-builder/query-manager";
import { SelectQueryBuilder } from "../query-builder/select-query-builder";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";

export class TableManager<T> {

   /**
    * 
    */
   public readonly connection: Connection;

   /**
    * 
    */
   public readonly tableMetadata: TableMetadata;

   /**
    * 
    */
   public readonly queryExecutor: QueryExecutor;

   /**
    * 
    * @param tableMetadata 
    * @param queryExecutor 
    */
   constructor(connection: Connection, tableMetadata: TableMetadata, queryExecutor?: QueryExecutor) {
      this.connection = connection;
      this.tableMetadata = tableMetadata;
      this.queryExecutor = queryExecutor as QueryExecutor;
   }

   /**
    * 
    * @param values 
    * @returns 
    */
   public create(values?: any): any {
      const object: T = new (this.tableMetadata.target)();
      if (values) {
         this.populateObject(object, values);
      }
      return object;
   }

   /**
    * 
    */
   public populateObject(object: any, values: any): void {
      
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
            const relationTableManager: TableManager<typeof relationTableMetadata.target> = this.connection.createTableManager(columnMetadata.relation.referencedTable);
            
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
   public async find(findOptions: FindOptions<T>, tableManager?: TableManager<T>): Promise<T[]> {

      /// create the query
      const query: SelectQueryBuilder<T> = this.createSelectQuery(findOptions, tableManager);

      /// run the query to get the result
      const result = await query.execute();

      if (result.rows.length > 0) {

         /// transformar o resultado da consulta nas suas classes específicas
         return result.rows.map((row: any) => this.create(row));
      }

      return [];
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(object: any, tableManager?: TableManager<T>): Promise<any> {

      const objectExists: boolean = await this.loadReference(object, tableManager);
      if (objectExists) {
         
         const updateQuery: UpdateQueryBuilder<any> = new UpdateQueryBuilder<any>(this.connection, tableManager?.queryExecutor)
            .table(this.tableMetadata)
            .set(object)
            .where()
            .returning(['campos chave primaria']);
         return updateQuery.execute();

      } else {

         const insertQuery: InsertQueryBuilder<any> = new InsertQueryBuilder<any>(this.connection, tableManager?.queryExecutor)
            .into(this.tableMetadata, [])
            .values(object)
            .returning(['campos chave primaria']);
         return insertQuery.execute();

      }
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(object: any, tableManager?: TableManager<T>): Promise<void> {

      const objectExists: boolean = await this.loadReference(object, tableManager);
      if (objectExists) {

         const deleteQuery: DeleteQueryBuilder<any> = new DeleteQueryBuilder<any>(this.connection, tableManager?.queryExecutor)
            .from(this.tableMetadata)
            .where()
            .returning(['campos chave primaria']);
         return deleteQuery.execute();

      }

   }

   /**
    * 
    * @returns 
    */
   public async loadReference(object: any, tableManager?: TableManager<T>, requester?: any): Promise<boolean> {

      const primaryKeys = (tableManager ?? this).tableMetadata.primaryKey?.columns as string[];

      const where: QueryWhere<T> = this.createWhereFromUnique(object);
      if (!where) {
         return false;
      }

      const orderBy: QueryOrder<T> = {};//primaryKeys.map<QueryOrder<T>>(primaryKey => { primaryKey: 'ASC' });

      const [result]: any = await this.find({
         select: primaryKeys,
         where: where,
         orderBy: orderBy
      });

      if (result) {
         for (const primaryKey in primaryKeys) {
            object[primaryKey] = result[primaryKey];
         }
         return true;
      }

      return false;
   }

   /**
    * 
    */
   public async loadAllReferences(object: any, tableManager?: TableManager<T>): Promise<void> {
      const queryExecutor = this.queryExecutor ?? tableManager?.queryExecutor ?? this.connection.createQueryExecutor();

      const parentRelations: ForeignKeyMetadata[] = this.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType != 'OneToMany');
      for (const relation of parentRelations) {
         const parent = object[relation.column.propertyName];
         if (parent) {

            const relationTableManager = this.connection.createTableManager(relation.referencedTable, queryExecutor);
            await relationTableManager.loadAllReferences(parent, relationTableManager);

         }
      }

      await this.loadReference(object, tableManager);

      const childRelations: ForeignKeyMetadata[] = this.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType == 'OneToMany');
      for (const relation of childRelations) {
         const children = (object[relation.column.propertyName] ?? []);
         for (const child of children) {

            const childTableManager = this.connection.createTableManager(relation.referencedTable, queryExecutor);
            await childTableManager.loadAllReferences(child, childTableManager);

         }
      }
   }

   /**
    * 
    * @param findOptions 
    * @param tableManager 
    * @returns 
    */
   private createSelectQuery(findOptions: FindOptions<T>, tableManager?: TableManager<T>): SelectQueryBuilder<T> {

      /// Obtain the list of columns to be consulted in the main table (if the 
      /// list of columns is not informed in the find options, all columns that 
      /// are unrelated will be obtained, or that the relation is in the 
      /// `relations` parameter).
      ///
      /// In the related columns, the `SelectQueryBuilder` will also be returned 
      /// to make the` left join` in the table and obtain the JSON of the table 
      /// data.
      const queryColumns: QueryColumn<T>[] = this.loadQueryColumns(this, findOptions.select, findOptions.relations, findOptions.roles);

      /// extract the `SelectQueryBuilder` from the related columns to generate
      /// the `left join` in the main table
      const queryJoins: QueryJoin<T>[] = this.loadQueryJoins(queryColumns);

      /// 
      const query = this.connection.createSelectQuery<T>(tableManager?.queryExecutor ?? this.queryExecutor)
         .select(queryColumns)
         .from(this.tableMetadata)
         .join(queryJoins)
         .where(findOptions?.where as QueryWhere<T>)
         .orderBy(findOptions.orderBy as QueryOrder<T>)
         .take(findOptions.take)
         .limit(findOptions.limit)

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
   private loadQueryColumns<T>(tableManager: TableManager<T>, columnsToBeLoaded?: FindSelect[], relations?: string[], roles?: string[]): QueryColumn<T>[] {

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
         const columnMetadata: ColumnMetadata = tableManager.tableMetadata.columns[columnData[0]];

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
            const relationTableManager: TableManager<typeof tableManager.tableMetadata.target> = this.connection.createTableManager(columnMetadata.relation.referencedTable, tableManager.queryExecutor);
            const relationQuery: SelectQueryBuilder<typeof tableManager.tableMetadata.target> = relationTableManager.createSelectQuery({
               select: (columnData.length > 1 ? columnData[1] as [string, FindSelect] : []),
               relations: (relations ?? [])
                  .filter(relation => relation.startsWith(`${columnMetadata.name}.`))
                  .map(relation => relation.substring(relation.indexOf('.') + 1, relation.length)),
               roles: roles
            });

               if (columnMetadata.relation.relationType == 'OneToMany') {

                  const referencedColumn: ColumnMetadata = relationTableManager.tableMetadata.columns[columnMetadata.relation.referencedColumn];
                  const relationQuery: SelectQueryBuilder<typeof tableManager.tableMetadata.target> = this.createChildSubquery(columnMetadata, columnData, relationTableManager, relations, roles);

                  queryColumns[columnData[0]] = {
                     table: relationAlias,
                     column: columnMetadata.propertyName,
                     relation: {
                        type: 'left',
                        table: relationQuery,
                        alias: relationAlias,
                        condition: `"${relationAlias}"."${referencedColumn.name}" = "${tableManager.tableMetadata.className}"."${referencedColumn.relation?.referencedColumn}"`
                     },
                  }

               } else {

                  const relationQuery: SelectQueryBuilder<typeof tableManager.tableMetadata.target> = this.createParentSubquery(columnMetadata, columnData, relationTableManager, relations, roles);

                  queryColumns[columnData[0]] = {
                     table: relationAlias,
                     column: columnMetadata.propertyName,
                     relation: {
                        type: 'left',
                        table: relationQuery,
                        alias: relationAlias,
                        condition: `"${relationAlias}"."${columnMetadata.relation.referencedColumn}" = "${tableManager.tableMetadata.className}"."${columnMetadata.name}"`
                     },
                  }

               }

         } else {

            queryColumns[columnData[0]] = {
               table: tableManager.tableMetadata.className,
               column: columnMetadata.name as string,
               alias: columnMetadata.propertyName
            }

         }
      }      
      
      return Object.values(queryColumns);
   }

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
   private loadQueryJoins(queryColumns: QueryColumn<T>[]): QueryJoin<T>[] {

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
    * @param object 
    * @returns 
    */
   public createWhereFromUnique(object: any): QueryWhere<T> {
      return {};
   }
}