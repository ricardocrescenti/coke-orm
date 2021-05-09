const path = require('path');
const fs = require('fs');
import { ConnectionOptions } from "./connection/connection-options";
import { SimpleMap } from  "./common/interfaces/map";
import { Connection } from "./connection/connection";
import { ConnectionAlreadyExistsError } from "./errors/connection-already-exists";
import { ConfigFileNotFoundError } from "./errors/config-file-not-found";

export class CokeORM {

   /**
    * 
    */
   public static readonly connections: SimpleMap<Connection> = {};

   /**
    * O construtor está declarado somente para não permitir que uma instância 
    * do CokeORM seja criado sem as validações necessárias
    */
   private constructor() {}

   /**
    * 
    * @param connectionOptions 
    */
   public static async connect(connectionOptions?: ConnectionOptions | ConnectionOptions[]): Promise<Connection> {
      
      /// if the configuration in the parameter is not informed, it will be 
      /// tried to load through the configuration file 'coke-orm.config.json' 
      /// located in the root folder
      if (!connectionOptions) {
         connectionOptions = this.loadConfigFile();
      }

      /// standardize the configuration to be an array of configurations
      if (!Array.isArray(connectionOptions)) {
         connectionOptions = [connectionOptions];
      }

      /// make the connection
      for (const options of connectionOptions) {

         /// checks if a configuration with the same name already exists
         if (CokeORM.connections[options.name ?? 'default'] != null) {
            throw new ConnectionAlreadyExistsError(options.name ?? 'default');
         }

         /// make the connection
         const connection: Connection = new Connection(options);
         if (await connection.connect()) {
            CokeORM.connections[options.name ?? 'default'] = connection;
         }

      }

      /// returns the first connection made, the others can be obtained by the 
      /// `get` method
      return CokeORM.connections[connectionOptions[0].name ?? 'default'];
   }

   private static loadConfigFile(): ConnectionOptions | ConnectionOptions[] {
      const configFileName = 'coke-orm.config.json';
      
      let configFilePath = path.join(__dirname, configFileName);
      if (!fs.existsSync(configFilePath)) {         
         throw new ConfigFileNotFoundError();
      }
      
      const configFile = require(configFilePath);
      return configFile;
   }

   /**
    * 
    * @param connectionName 
    */
   public static get(connectionName?: string): Connection {
      if (CokeORM.connections[connectionName ?? 'default'] == null) {
         throw Error(`A conexão '${connectionName}' já existe`);
      }

      return CokeORM.connections[connectionName ?? 'default'];
   }
}

