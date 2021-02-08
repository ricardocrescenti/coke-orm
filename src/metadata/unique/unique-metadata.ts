import { ColumnMetadata } from "../columns/column-metadata";

export class UniqueMetadata {

   public readonly name: string;
   public readonly columns: ColumnMetadata[];

   constructor(name: string, columns: ColumnMetadata[]) {
      this.name = name;
      this.columns = columns;
   }

}