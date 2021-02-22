import { QueryExecutor } from "../../query-executor/query-executor";

export type TransactionProcess<T> = (queryRunner: QueryExecutor) => Promise<T>;