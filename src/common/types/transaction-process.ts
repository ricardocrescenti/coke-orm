import { QueryRunner } from "../../query-runner/query-runner";

export type TransactionProcess<T> = (queryRunner: QueryRunner) => Promise<T>;