import { QueryRunner } from "../../query-runner";

export type TransactionProcess<T> = (queryRunner: QueryRunner) => Promise<T>;