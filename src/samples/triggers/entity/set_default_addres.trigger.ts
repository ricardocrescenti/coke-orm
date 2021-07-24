/* eslint-disable require-jsdoc */
import { Trigger } from '../../../decorators';
import { TriggerInterface } from '../../../metadata';
import { EntityAddressModel } from '../../models/entity/entity-address.model';

/**
 * Test Trigger
 */
@Trigger(EntityAddressModel, { fires: 'BEFORE', events: ['INSERT', 'UPDATE'] })
export class SetDefaultAddressTrigger implements TriggerInterface {

	// when = `OLD is null or OLD.is_default <> NEW.is_default`;

	variables = [
		{ name: 'hasAddress', type: 'INTEGER' },
		{ name: 'hasAddressTest', type: 'INTEGER' },
	]

	code = ` 
		hasAddress = 0;
		
		SELECT count(*)
		From entities_addresses
		Where entity_id = NEW.entity_id
		Into hasAddress;
		
		IF ((NEW.is_default = true) and (hasAddress > 0)) THEN
			Update entities_addresses
			Set is_default = false
			Where entity_id = NEW.entity_id
			and id <> NEW.id;
		ELSEIF (hasAddress <= 0) THEN
			NEW.is_default = true;
		ELSE
			NEW.is_default = false;
		END IF;
		
		RETURN NEW;`;

}
