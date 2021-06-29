import { ForeignKeyMetadata } from "../../metadata";
import { QueryRunner } from "../../query-runner";
import { EntitySubscriberInterface } from "../../metadata/event";

export class SaveOptions<T = any> {
   queryRunner: QueryRunner;
   relation?: ForeignKeyMetadata;
   requester?: any;
   subscriber?: EntitySubscriberInterface<T>;
   recreateObjects?: boolean;

   constructor(options: SaveOptions) {
      this.queryRunner = options.queryRunner;
      this.relation = options.relation;
      this.requester = options.requester;
      this.subscriber = options.subscriber;
      this.recreateObjects = options.recreateObjects ?? true;
   }
}