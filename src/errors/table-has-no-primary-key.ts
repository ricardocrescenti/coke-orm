export class TableHasNoPrimaryKey extends Error {

   constructor(tableClassName: string) {
      super(`The '${tableClassName}' table in the query has no primary key to load your reference.`);
   }

}