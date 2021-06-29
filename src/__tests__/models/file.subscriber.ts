/* eslint-disable require-jsdoc */
import { EventsSubscriber } from '../../decorators';
import { EntitySubscriberInterface, InsertEvent } from '../../metadata';
import { FileModel } from './file.model';

@EventsSubscriber(FileModel)
export class FileSubscriber implements EntitySubscriberInterface<FileModel> {

	beforeInsert(event: InsertEvent<FileModel>): void | Promise<void> {
		if (event.entity.test == '1') {
			event.entity.test = '2';
		}
		event.entity.publicUrl = event.entity.privateUrl;
	}

	afterInsert(event: InsertEvent<FileModel>): void | Promise<void> {
		if (event.entity.test == '2') {
			event.entity.test = '3';
		}
	}

	beforeUpdate(event: InsertEvent<FileModel>): void | Promise<void> {
		if (event.entity.test == '1') {
			event.entity.test = '2';
		}
		event.entity.publicUrl = event.entity.privateUrl;
	}

	afterUpdate(event: InsertEvent<FileModel>): void | Promise<void> {
		if (event.entity.test == '2') {
			event.entity.test = '3';
		}
	}

}
