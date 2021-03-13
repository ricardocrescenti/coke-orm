import { ConnectionOptions } from "./connection/connection-options";
import { SimpleMap } from  "./common/interfaces/map";
import { Connection } from "./connection/connection";
import { ConnectionAlreadyExistsError } from "./errors/connection-already-exists";

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
   public static async connect(connectionOptions: ConnectionOptions): Promise<Connection> {
      if (CokeORM.connections[connectionOptions.name ?? 'default'] != null) {
         throw new ConnectionAlreadyExistsError(connectionOptions.name ?? 'default');
      }

      const connection: Connection = new Connection(connectionOptions);
      if (await connection.connect()) {
         CokeORM.connections[connectionOptions.name ?? 'default'] = connection;
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

