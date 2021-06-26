import { EventsSubscriber } from "../../../decorators";
import { EntitySubscriberInterface, UpdateEvent } from "../../../metadata";
import { EntityModel } from "./entity.model";

@EventsSubscriber(EntityModel)
export class EntitySubscriber implements EntitySubscriberInterface<EntityModel> {

	beforeUpdate(event: UpdateEvent<EntityModel>): void | Promise<any> {
		event.entity.name += ' ' + event.entity.name?.length;
	}

}