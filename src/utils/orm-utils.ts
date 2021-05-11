import { ConnectionOptions } from "../connection/connection-options";

const path = require('path');

export class OrmUtils {
   private constructor() {}

   public static rootPath(connectionOptions: ConnectionOptions, useSourcePath: boolean = false): Promise<string> {
      return path.join(process.cwd(), (useSourcePath ? connectionOptions.additional?.sourceDir : connectionOptions.additional?.outDir));
   }
}