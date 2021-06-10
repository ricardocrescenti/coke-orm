import { QueryRunner } from "../../query-runner";
import { EntitySubscriberInterface } from "../../metadata/event";

export class DeleteOptions<T = any> {
   queryRunner?: QueryRunner;
   requester?: any;
   subscriber?: EntitySubscriberInterface<T>;
}