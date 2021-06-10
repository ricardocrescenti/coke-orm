import { Connection, ConnectionOptions } from "./connection";
import { SimpleMap } from  "./common";
import { ConnectionAlreadyExistsError } from "./errors";
import { OrmUtils } from "./utils";

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

         connectionOptions = OrmUtils.loadConfigFile();
      
      } else {

         /// standardize the configuration to be an array of configurations
         if (!Array.isArray(connectionOptions)) {
            connectionOptions = [connectionOptions];
         }

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

   /**
    * 
    * @param connectionName 
    */
   public static hasConnection(connectionName: string) {
      if (this.connections[connectionName]) {
         return true;
      }
      return false;
   }

   /**
    * 
    * @param connectionName 
    */
   public static getConnection(connectionName?: string): Connection {
      const connection: Connection = CokeORM.connections[connectionName ?? 'default'];
      if (!connection) {
         throw Error(`A conexão '${connectionName}' já existe`);
      }

      return connection;
   }
}

