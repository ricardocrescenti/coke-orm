import { Connection } from "../../connection/connection";
import { ForeignKeyMetadata } from "../../metadata/foreign-key";
import { QueryRunner } from "../../query-runner/query-runner";

export class SaveOptions {
   queryRunner?: QueryRunner | Connection;
   relation?: ForeignKeyMetadata;
   requester?: any;
}