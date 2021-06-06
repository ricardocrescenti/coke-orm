import { Connection } from "../../connection";
import { ForeignKeyMetadata } from "../../metadata";
import { QueryRunner } from "../../connection";

export class SaveOptions {
   queryRunner?: QueryRunner | Connection;
   relation?: ForeignKeyMetadata;
   requester?: any;
}