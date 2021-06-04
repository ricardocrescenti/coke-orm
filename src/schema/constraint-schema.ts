export abstract class ConstraintSchema {

   public readonly name: string;
   public readonly columns: string[] = [];

   constructor(constraint: Omit<ConstraintSchema, "columns">) {
      this.name = constraint.name;
   }
}