export class EntityHasNoPrimaryKeyError extends Error {

   constructor(entityClassName: string) {
      super(`The '${entityClassName}' entity has no primary key`);
   }

}