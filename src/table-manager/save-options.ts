import { Connection } from "../connection/connection";
import { ForeignKeyMetadata } from "../metadata";
import { QueryExecutor } from "../query-executor/query-executor";

export class SaveOptions {
   queryExecutor?: QueryExecutor | Connection;
   relation?: ForeignKeyMetadata;
}