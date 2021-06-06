import { SimpleMap } from "../common";
import { Connection } from "../connection";
import { ColumnMetadata, EntitySubscriberInterface, ForeignKeyMetadata, EntityMetadata } from "../metadata";
import { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, QueryWhere } from "../query-builder";
import { FindOptions } from "./options/find-options";
import { QueryRelationBuilder, QueryColumnBuilder, QueryDatabaseColumnBuilder, QueryJsonAggColumnBuilder, QueryJsonColumnBuilder, QueryWhereColumnBuilder, QueryAggregateColumnBuilder } from "../query-builder";
import { FindSelect } from "./types/find-select";
import { EntityValues } from "./types/entity-values";
import { CokeModel } from "./coke-model";
import { SaveOptions } from "./options/save-options";
import { StringUtils } from "../utils";
import { OrmUtils } from "../utils";
import { QueryRunner } from "../connection";
import { ColumnMetadataNotLocatedError, DuplicateColumnInQuery } from "../errors";

export class EntityManager<T> {

   /**
    * 
    */
   public get connection(): Connection {
      return this.entityMetadata.connection;
   }

   /**
    * 
    */
   public readonly entityMetadata: EntityMetadata;

   /**
    * 
    * @param entityMetadata
    */
   constructor(entityMetadata: EntityMetadata) {
      this.entityMetadata = entityMetadata;
   }

   /**
    * 
    * @param values 
    * @returns 
    */
   public create(values?: EntityValues<T>): any {
      if (values == null) {
         return null;
      }

      const object: T = new (this.entityMetadata.target)();
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

      /// get only the entity columns that are in the values object to be 
      /// populated in the main object

      const columnsMetadata: ColumnMetadata[] = Object.values(this.entityMetadata.columns).filter(columnMetadata => objectKeys.indexOf(columnMetadata.propertyName) >= 0);

      /// load the values into the main object
      for (const columnMetadata of columnsMetadata) {

         if (columnMetadata.relation) {

            const relationEntityManager: EntityManager<any> = this.connection.getEntityManager(columnMetadata.relation.referencedEntity);
            
            if (columnMetadata.relation.type == 'OneToMany') {
               object[columnMetadata.propertyName] = values[columnMetadata.propertyName].map((value: any) => relationEntityManager.create(value));
            } else {
               object[columnMetadata.propertyName] = relationEntityManager.create(values[columnMetadata.propertyName]);
            }

         } else {
            object[columnMetadata.propertyName] = values[columnMetadata.propertyName];
         }

      }
   }

   /**
    * 
    * @param findOptions 
    * @returns 
    */
   public async findOne(findOptions: FindOptions<T>, queryRunner?: QueryRunner | Connection, runEventAfterLoad = true): Promise<T> {
      
      const [result]: any = await this.find({ 
         ...findOptions,
         limit: 1
      }, queryRunner, runEventAfterLoad);
      
      return result;
   
   }

   /**
    * 
    * @param findOptions 
    * @returns 
    */
   public async find(findOptions?: FindOptions<T>, queryRunner?: QueryRunner | Connection, runEventAfterLoad = true): Promise<T[]> {

      /// create the query
      const query: SelectQueryBuilder<T> = this.createSelectQuery(findOptions, 0);

      /// run the query to get the result
      const result = await query.execute(queryRunner);

      if (result.rows.length > 0) {

         /// create the entity-related subscriber to run the events
         const subscriber: EntitySubscriberInterface<T> | undefined = (runEventAfterLoad ? this.createEntitySubscriber() : undefined);

         /// transform the query result into its specific classes
         for (let i = 0; i < result.rows.length; i++) {
            result.rows[i] = this.create(result.rows[i]);

            if (subscriber?.afterLoad) {
               await subscriber.afterLoad({
                  connection: (queryRunner?.connection ?? this.connection),
                  queryRunner: (queryRunner instanceof QueryRunner ? queryRunner : undefined),
                  manager: this,
                  findOptions: findOptions,
                  entity: result.rows[i]
               });
            }
         }
         return result.rows;

      }

      return [];
   }

   /**
    * 
    */
   public async save(object: EntityValues<T>, saveOptions?: SaveOptions): Promise<any> {
      const objectToSave: CokeModel = this.create(object);
      return objectToSave.save(saveOptions?.queryRunner ?? this.connection, saveOptions);
   }

   /**
    * 
    * @param queryRunner 
    */
   public async delete(object: any, queryRunner?: QueryRunner | Connection): Promise<boolean> {
      const objectToDelete: CokeModel = this.create(object);
      return objectToDelete.delete(queryRunner ?? this.connection);
   }

   /**
    * 
    * @param findOptions 
    * @returns 
    */
   public createSelectQuery(findOptions?: FindOptions<T>, level?: number, relationMetadata?: ForeignKeyMetadata): SelectQueryBuilder<T> {

      /// create a copy of findOptions to not modify the original and help to 
      /// copy it with the standard data needed to find the records
      findOptions = new FindOptions(findOptions);
      FindOptions.loadDefaultOrderBy(this.entityMetadata, findOptions);

      /// obtain the list of columns to be consulted in the main entity (if the 
      /// list of columns is not informed in the find options, all columns that 
      /// are unrelated will be obtained, or that the relation is in the 
      /// `relations` parameter).
      ///
      /// In the related columns, the `SelectQueryBuilder` will also be returned 
      /// to make the` left join` in the entity and obtain the JSON of the entity 
      /// data.
      const queryColumns: QueryColumnBuilder<T>[] = this.loadQueryColumns(findOptions, level ?? 0);

      /// extract the `SelectQueryBuilder` from the related columns to generate
      /// the `left join` in the main entity
      const queryJoins: QueryRelationBuilder<T>[] = this.loadQueryJoins(queryColumns);

      /// if the entity has a column with 'DeletedAt' operation, a filter will be 
      /// added to 'findOptions.where' so as not to get the deleted rows
      const deletedAtColumnMetadata: ColumnMetadata | null = this.entityMetadata.getDeletedAtColumn();
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
      const query: SelectQueryBuilder<T> = this.connection.createSelectQuery<T>(this.entityMetadata)
         .level(level ?? 0)
         .select(queryColumns)
         .join(queryJoins)
         //.virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name)
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
    * @returns 
    */
   public createInsertQuery(): InsertQueryBuilder<T> {
      return this.connection.createInsertQuery<T>(this.entityMetadata);
   }

   /**
    * 
    * @returns 
    */
   public createUpdateQuery() : UpdateQueryBuilder<T> {
      const query: UpdateQueryBuilder<T> = this.connection.createUpdateQuery<T>(this.entityMetadata)
         //.virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name);
      return query;      
   }

   /**
    * 
    * @returns 
    */
   public createDeleteQuery(): DeleteQueryBuilder<T> {
      const query: DeleteQueryBuilder<T> = this.connection.createDeleteQuery<T>(this.entityMetadata)
         //.virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name);
      return query;
   }

   /**
    * 
    * @param columnsToBeLoaded 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private loadQueryColumns<T>(findOptions: FindOptions<T>, level: number): QueryColumnBuilder<T>[] {

      /// If there are no columns informed to be loaded, all columns of entities 
      /// that do not have relations will be obtained, or that the relation is 
      /// in the parameter `relations`.
      if (!findOptions.select || findOptions.select.length == 0) 
      {
         findOptions.select = Object.values(this.entityMetadata.columns)
            .filter(column => column.canSelect && (!column.relation || (column.relation.eager || (findOptions.relations ?? []).indexOf(column.propertyName) >= 0)))
            .map(column => column.propertyName);
      }

      /// initialize the array that will store the query columns
      const queryColumns: SimpleMap<QueryColumnBuilder<T>> = new SimpleMap();

      for (const columnStructure of findOptions.select) {

         const columnData: [string, FindSelect] = (typeof columnStructure == 'string' ? [columnStructure, []] : columnStructure) as [string, FindSelect];         
         const columnMetadata: ColumnMetadata = this.entityMetadata.columns[columnData[0]];

         if (!columnMetadata) {
            throw new ColumnMetadataNotLocatedError(this.entityMetadata.className, columnData[0]);
         }

         if (queryColumns[columnData[0]]) {
            throw new DuplicateColumnInQuery(columnMetadata);
         }

         /// If the column has roles restrictions, it will only appear in the 
         /// query result if the role is informed in the findOptions.roles
         if ((columnMetadata.roles ?? []).length > 0 && columnMetadata.roles?.some((role => (findOptions.roles?.indexOf(role) ?? 0) < 0))) {
            continue;
         }

         if (columnMetadata.relation) {

            const relationAlias: string = this.connection.options.namingStrategy?.eagerJoinRelationAlias(columnMetadata) as string;
            const relationEntityManager: EntityManager<any> =  this.connection.getEntityManager(columnMetadata.relation.referencedEntity);

            if (columnMetadata.relation.type == 'OneToMany') {

               const referencedColumn: ColumnMetadata = relationEntityManager.entityMetadata.columns[columnMetadata.relation.referencedColumn];
               const relationQuery: SelectQueryBuilder<any> = this.createChildSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1);

               queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
                  table: relationAlias,
                  column: columnMetadata.propertyName,
                  alias: columnMetadata.propertyName,
                  relation: new QueryRelationBuilder<any>({
                     type: 'left',
                     table: relationQuery,
                     alias: relationAlias,
                     condition: `"${relationAlias}"."${referencedColumn.propertyName}" = "${this.entityMetadata.className}"."${referencedColumn.relation?.referencedColumn}"`
                  }),
               });

            } else {

               const relationQuery: SelectQueryBuilder<any> = this.createParentSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1);

               queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
                  table: relationAlias,
                  column: columnMetadata.propertyName,
                  alias: columnMetadata.propertyName,
                  relation: new QueryRelationBuilder<any>({
                     type: ((findOptions.where as any ?? {})[columnMetadata.propertyName] ? 'inner' : 'left'),
                     table: relationQuery,
                     alias: relationAlias,
                     condition: `"${relationAlias}"."${columnMetadata.relation.referencedColumn}" = "${this.entityMetadata.className}"."${columnMetadata.name}"`
                  }),
               });

            }

         } else {

            queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
               table: this.entityMetadata.className,
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
    * @param relationEntityManager 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private createSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager<any>, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
      
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

               subqueryWhere[i][`${columnMetadata.propertyName}_${columnMetadata.relation?.referencedEntity}.${sha1Where}`] = { equal: true };
               delete where[columnMetadata.propertyName];
            
            }

         }

      }

      const subqueryOrderBy: any = (findOptions.orderBy as any ?? {})[columnMetadata.propertyName];

      const relationQuery: SelectQueryBuilder<T> = relationEntityManager.createSelectQuery({
         select: (columnData.length > 1 ? columnData[1] as [string, FindSelect] : []),
         relations: subqueryRelations,
         where: queryWhereColumns.map(queryWhereColumn => queryWhereColumn.where) as any,
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
    * @param relationEntityManager 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private createChildSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager<any>, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
      const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level);

      relationQuery.select([
         new QueryDatabaseColumnBuilder({
            table: relationEntityManager.entityMetadata.className,
            column: relationEntityManager.entityMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName as string,
            alias: relationEntityManager.entityMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName as string
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
         table: relationEntityManager.entityMetadata.className,
         column: relationEntityManager.entityMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName,
         alias: relationEntityManager.entityMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName
      }));

      /// remove o order by pois ele foi adicionado dentro do SelectJsonAgg
      relationQuery.orderBy();

      return relationQuery;
   }

   /**
    * 
    * @param columnMetadata 
    * @param columnData 
    * @param relationEntityManager 
    * @param relations 
    * @param roles 
    * @returns 
    */
   private createParentSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager<any>, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
      const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level);

      relationQuery.select([
         new QueryDatabaseColumnBuilder({
            table: relationEntityManager.entityMetadata.className,
            column: columnMetadata.relation?.referencedColumn as string,
            alias: relationEntityManager.entityMetadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName
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
   private loadQueryJoins(queryColumns: QueryColumnBuilder<T>[]): QueryRelationBuilder<T>[] {

      return queryColumns
         .filter((queryColumn) => queryColumn instanceof QueryDatabaseColumnBuilder && queryColumn.relation)
         .map((queryColumn) => {

            return new QueryRelationBuilder<T>({
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

      const where: QueryWhere<any> = {};
      for (const column of columns) {

         if (valuesKeys.indexOf(column) < 0) {
            return undefined;
         }

         const columnMetadata: ColumnMetadata = this.entityMetadata.columns[column];
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

   /**
    * Create the entity-related subscriber to run the events
    */
   public createEntitySubscriber(): EntitySubscriberInterface<T> | undefined {
      if (this.entityMetadata.subscriber) {
         return new (this.entityMetadata.subscriber)();
      }
      return undefined;
   }
}