import { ForeignKeyMetadata } from "../../metadata";
import { QueryRunner } from "../../query-runner";
import { EntitySubscriberInterface } from "../../metadata/event";

export class SaveOptions<T = any> {
   queryRunner?: QueryRunner;
   relation?: ForeignKeyMetadata;
   requester?: any;
   subscriber?: EntitySubscriberInterface<T>;
}