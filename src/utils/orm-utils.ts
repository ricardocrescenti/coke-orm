import { ConnectionOptions } from "../connection/connection-options";

const path = require('path');

export class OrmUtils {
   private constructor() {}

   public static rootPath(connectionOptions: ConnectionOptions, useSourcePath: boolean = false): Promise<string> {
      return path.join(process.cwd(), (useSourcePath ? connectionOptions.additional?.sourceDir : connectionOptions.additional?.outDir));
   }

   public static isEmpty(value: any): boolean {
      if (value) {
         return Object.keys(value).length == 0;
         // if (Array.isArray(value)) {
         //    return value.length == 0;
         // } else if (value instanceof Object) {
         //    return ;
         // }
      }
      return true;
   }

   public static isNotEmpty(value: any): boolean {
      return !this.isEmpty(value);
   }
}