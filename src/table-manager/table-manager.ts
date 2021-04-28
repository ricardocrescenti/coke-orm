import { QueryExecutor } from "..";
import { SimpleMap } from "../common/interfaces/map";
import { Connection } from "../connection/connection";
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from "../metadata";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { FindOptions } from "../find-options/find-options";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { SelectQueryBuilder } from "../query-builder/select-query-builder";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";
import { QueryWhere, QueryWhereColumn } from "../query-builder/types/query-where";
import { QueryJoin } from "../query-builder/types/query-join";
import { QueryColumn } from "../query-builder/types/query-column";
import { QueryOrder } from "../query-builder/types/query-order";
import { FindSelect } from "../find-options/types/find-select";
import { TableValues } from "./types/table-values";

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
   
      // TODO carregar as relações com base na necessidade das condiçoes
      // TODO parâmetros nos joins

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
    * @param findOptions 
    * @param tableManager 
    * @returns 
    */
   public async findOne(findOptions: FindOptions<T>, tableManager?: TableManager<T>) {
      const [result]: any = await this.find({ 
         ...findOptions,
         limit: 1,
         orderBy: (findOptions.orderBy ?? (tableManager ?? this).tableMetadata.primaryKey?.columns)
      }, tableManager);
      return result;
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(object: TableValues<T>, tableManager?: TableManager<T>): Promise<any> {

      /// create a copy of the object so as not to modify the object passed by 
      /// parameter
      const objectToSave = this.create({ ...object });

      const columnsToSave: string[] = Object.keys(objectToSave);
      const columnsParentRelation: ColumnMetadata[] = Object.values(this.tableMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation && columnMetadata.relation.relationType != 'OneToMany');
      const columnsChildrenRelation: ColumnMetadata[] = Object.values(this.tableMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation?.relationType == 'OneToMany');

      for (const columnParentRelation of columnsParentRelation) {

         const parentTableManager = this.connection.createTableManager(columnParentRelation.relation?.referencedTable as string);
         const parentObject = (objectToSave as any)[columnParentRelation.propertyName];

         if (parentObject instanceof Object) { 
            const savedParentObject = await parentTableManager.save(parentObject);
            (objectToSave as any)[columnParentRelation.propertyName] = savedParentObject[columnParentRelation.relation?.referencedColumn as string];
         }

      }

      //for (const )
      /// ADICIONAR O EVENTO ANTES DE CARREGAR REFERENCIA, QUE DAI NOS OBJETOS QUE TEM
      /// A ENTITYMODEL COMO PARENT ELES SERÃO CARREGADOS PELO PARENT.

      let savedObject;
      const objectExists: boolean = await this.loadPrimaryKey(objectToSave, tableManager);
      if (objectExists) {
         
         const where: QueryWhere<T> | undefined = this.createWhereFromColumns(objectToSave, this.tableMetadata.primaryKey?.columns ?? []);

         const updateQuery: UpdateQueryBuilder<T> = this.createUpdateQuery(tableManager)
            .set(objectToSave)
            .where(where)
            .returning(this.tableMetadata.primaryKey?.columns);
         savedObject = await updateQuery.execute();

      } else {

         const insertQuery: InsertQueryBuilder<T> = this.createInsertQuery(tableManager)
            .values(objectToSave)
            .returning(this.tableMetadata.primaryKey?.columns);
         savedObject = await insertQuery.execute();

      }
      savedObject = this.create(savedObject.rows[0])

      for (const columnChildRelation of columnsChildrenRelation) {

         const childTableManager = this.connection.createTableManager(columnChildRelation.relation?.referencedTable as string);
         for (const childIndex in (objectToSave as any)[columnChildRelation.propertyName]) {


            const childObject = (objectToSave as any)[columnChildRelation.propertyName][childIndex];
            childObject[columnChildRelation.relation?.referencedColumn as string] = savedObject[this.tableMetadata.primaryKey?.columns[0] as string];

            const savedChildObject = await childTableManager.save(childObject);
            (objectToSave as any)[columnChildRelation.propertyName][childIndex] = childTableManager.create(savedChildObject);

         }

      }

      return savedObject;
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(object: any, tableManager?: TableManager<T>): Promise<void> {

      const objectExists: boolean = await this.loadPrimaryKey(object, tableManager);
      if (objectExists) {
         
         const where: QueryWhere<T> | undefined = this.createWhereFromColumns(object, this.tableMetadata.primaryKey?.columns ?? []);

         const deleteQuery: DeleteQueryBuilder<any> = new DeleteQueryBuilder<any>(this.connection, this.tableMetadata, tableManager?.queryExecutor)
            .where(where)
            .returning(['campos chave primaria']);
         return deleteQuery.execute();

      }

   }

   /**
    * 
    * @returns 
    */
   public async loadPrimaryKey(object: any, tableManager?: TableManager<T>, requester?: any): Promise<boolean> {
      // TODO: criar um LoadOptions para indicar os campos a serem carregados

      /// get the list of properties of the object to be tested

      const objectKeys: string[] = Object.keys(object ?? {});

      /// checks if the object has properties to be tested

      if (objectKeys.length == 0) {
         return false;
      }

      /// get the list of primary keys to be loaded
      
      const primaryKeys = (tableManager ?? this).tableMetadata.primaryKey?.columns as string[];

      /// check that the primary keys are informed in the query object, so that 
      /// an unnecessary new query is not made

      if (primaryKeys.every(primaryKey => object[primaryKey] != null)) {
         return true;
      }

      /// get the unique indexes and unique keys to make the queries

      const indexes: ConcatArray<string[]> = this.tableMetadata.indexs.filter(index => index.unique).map(index => index.columns);
      const uniques: ConcatArray<string[]> = this.tableMetadata.uniques.map(index => index.columns);

      for (const columns of (new Array<string[]>()).concat(indexes, uniques)) {

         /// create the condition using the first unique index or unique key to 
         /// query the object

         const where: QueryWhere<T> | undefined = this.createWhereFromColumns(object, columns);
         if (!where) {
            continue;
         }

         /// run the query to verify the object and verify that it exists

         const result: any = await this.findOne({
            select: primaryKeys,
            where: where,
            orderBy: primaryKeys
         }, tableManager);

         /// If the requested object exists in the database, the primary keys will
         /// be loaded into the current object

         if (result) {
            for (const primaryKey of primaryKeys) {
               object[primaryKey] = result[primaryKey];
            }
            return true;
         }

      }

      return false;
   }

   /**
    * 
    */
   public async loadPrimaryKeyCascade(object: any, tableManager?: TableManager<T>): Promise<void> {

      const parentRelations: ForeignKeyMetadata[] = this.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType != 'OneToMany');
      for (const relation of parentRelations) {
         const parent = object[relation.column.propertyName];
         if (parent) {

            const relationTableManager = this.connection.createTableManager(relation.referencedTable, tableManager?.queryExecutor);
            await relationTableManager.loadPrimaryKeyCascade(parent, relationTableManager);

         }
      }

      await this.loadPrimaryKey(object, tableManager);

      const childRelations: ForeignKeyMetadata[] = this.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType == 'OneToMany');
      for (const relation of childRelations) {
         const children = (object[relation.column.propertyName] ?? []);
         for (const child of children) {

            const childTableManager = this.connection.createTableManager(relation.referencedTable, tableManager?.queryExecutor);
            await childTableManager.loadPrimaryKeyCascade(child, childTableManager);

         }
      }
   }

   /**
    * 
    * @param findOptions 
    * @param tableManager 
    * @returns 
    */
   public createSelectQuery(findOptions: FindOptions<T>, tableManager?: TableManager<T>): SelectQueryBuilder<T> {

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

      let orderBy: any = findOptions.orderBy;
      if (Array.isArray(findOptions.orderBy)) {

         orderBy = {};
         for (const column of findOptions.orderBy) {
            orderBy[column] = 'ASC';
         }

      }

      /// create the query to get the data
      const query = this.connection.createSelectQuery<T>(this.tableMetadata, tableManager?.queryExecutor ?? this.queryExecutor)
         .select(queryColumns)
         .join(queryJoins)
         .where(findOptions?.where)
         .orderBy(orderBy as QueryOrder<T>)
         .take(findOptions.take)
         .limit(findOptions.limit)

      return query;
   }

   public createInsertQuery(tableManager?: TableManager<T>): InsertQueryBuilder<T> {
      return this.connection.createInsertQuery(this.tableMetadata, tableManager?.queryExecutor);
   }

   public createUpdateQuery(tableManager?: TableManager<T>) : UpdateQueryBuilder<T> {
      return this.connection.createUpdateQuery(this.tableMetadata, tableManager?.queryExecutor);
   }

   public createDeleteQuery(tableManager?: TableManager<T>): DeleteQueryBuilder<T> {
      return this.connection.createDeleteQuery(this.tableMetadata, tableManager?.queryExecutor);
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
                     relation: new QueryJoin<any>({
                        type: 'left',
                        table: relationQuery,
                        alias: relationAlias,
                        condition: `"${relationAlias}"."${referencedColumn.name}" = "${tableManager.tableMetadata.className}"."${referencedColumn.relation?.referencedColumn}"`
                     }),
                  }

               } else {

                  const relationQuery: SelectQueryBuilder<typeof tableManager.tableMetadata.target> = this.createParentSubquery(columnMetadata, columnData, relationTableManager, relations, roles);

                  queryColumns[columnData[0]] = {
                     table: relationAlias,
                     column: columnMetadata.propertyName,
                     relation: new QueryJoin<any>({
                        type: 'left',
                        table: relationQuery,
                        alias: relationAlias,
                        condition: `"${relationAlias}"."${columnMetadata.relation.referencedColumn}" = "${tableManager.tableMetadata.className}"."${columnMetadata.name}"`
                     }),
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
   private createWhereFromColumns(values: any, columns: string[]): QueryWhere<T> | undefined {

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