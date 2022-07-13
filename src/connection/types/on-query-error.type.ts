import { QueryRunner } from '../../query-runner';

export type OnQueryError = (queryRunner: QueryRunner, error: Error, query: string, params?: any[]) => any | Promise<any>;
