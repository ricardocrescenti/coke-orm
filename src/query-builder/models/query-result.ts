export class QueryResult {

   public rows: any[];
   public rowCount: number;

   constructor(result: QueryResult) {
      this.rows = result.rows;
      this.rowCount = result.rowCount;
   }

}