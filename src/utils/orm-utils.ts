const path = require('path');
const fs = require('fs');
import { ConnectionOptions } from "../connection";
import { ConfigFileNotFoundError, ConnectionNameDoesNotExistError } from "../errors";

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

   /**
    * 
    * @param connectionName 
    * @returns 
    */
   public static loadConfigFile(connectionName?: string): ConnectionOptions[] {      
      
      /// default configuration file name
      const configFileName = 'coke-orm.config.json';
      const configFilePath = path.join(process.cwd(), configFileName);

      /// mount the configuration file path
      if (!fs.existsSync(configFilePath)) {         
         throw new ConfigFileNotFoundError();
      }
      
      /// load the configuration file
      let connectionsOptions = require(configFilePath);
      
      /// standardize the configuration to be an array of configurations
      if (!Array.isArray(connectionsOptions)) {
         connectionsOptions = [connectionsOptions];
      }

      /// 
      for (let i = 0; i < connectionsOptions.length; i++) {
         connectionsOptions[i] = new ConnectionOptions(connectionsOptions[i]);
      }

      /// if the name of the connection is entered in the method parameter, this 
      /// connection will be attempted, if it does not exist, an error will be 
      /// thrown
      if (connectionName) {
         connectionsOptions = connectionsOptions.filter((configFile: ConnectionOptions) => (configFile.name ?? 'default') == connectionName);
         if (!connectionsOptions) {
            throw new ConnectionNameDoesNotExistError(connectionName);
         }
      }

      return connectionsOptions;
   }
}