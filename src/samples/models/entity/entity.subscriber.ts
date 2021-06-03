import { EventsSubscriber } from "../../../decorators";
import { TableSubscriber } from "../../../metadata/events/table-subscriber";
import { UpdateEvent } from "../../../metadata/events/update-event";
import { EntityModel } from "./entity.model";

@EventsSubscriber(EntityModel)
export class EntitySubscriber extends TableSubscriber<EntityModel> {

   beforeUpdate(event: UpdateEvent<EntityModel>): void | Promise<any> {
      event.data.name += ' ' + event.data.name?.length;
   }

}