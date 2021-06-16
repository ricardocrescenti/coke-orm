import { QueryRunner } from "../../query-runner";
import { EntitySubscriberInterface } from "../../metadata/event";

export class DeleteOptions<T = any> {
   queryRunner: QueryRunner;
   requester?: any;
   subscriber?: EntitySubscriberInterface<T>;

   constructor(options: DeleteOptions) {
      this.queryRunner = options.queryRunner;
      this.requester = options.requester;
      this.subscriber = options.subscriber;
   }
}