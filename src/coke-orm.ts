import { ConnectionOptions } from "./connection/connection-options";
import { Map } from  "./common/interfaces/map";
import { Connection } from "./connection/connection";

export class CokeORM {

   /**
    * 
    */
   public static readonly connections: Map<Connection> = {};

   private constructor() {}

   /**
    * 
    * @param connectionOptions 
    */
   public static async connect(connectionOptions: ConnectionOptions): Promise<Connection | null> {
      if (CokeORM.connections[connectionOptions.name ?? 'default'] != null) {
         throw Error(`The '${connectionOptions.name}' connection already exists`);
      }

      const connection: Connection = new Connection(connectionOptions);
      //await connection.connect();

      try {

         if (connection.options.migrations?.runMigrations) {
            await connection.schema.load();
         }
         /// carregar os dados mapeados
         /// rodar as migrations

         CokeORM.connections[connectionOptions.name ?? 'default'] = connection;

      } catch (error) {
         throw error;
      }

      return CokeORM.connections[connectionOptions.name ?? 'default'];
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

