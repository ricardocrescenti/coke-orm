const path = require('path');
const fs = require('fs');
import { ConnectionOptions } from '../connection';
import { ConfigFileNotFoundError, ConnectionNameDoesNotExistError } from '../errors';

/**
 * Useful Classes for ORM.
 */
export class OrmUtils {

	/**
	 * Constructor with private access to not allow creating this class, as
	 * all methods will be static.
	 */
	private constructor() {}

	/**
	 * Create the path to the specified folder from the project's root folder.
	 * @param {string} dir Final path to be requested.
	 * @return {string} Full path to requested folder.
	 */
	public static pathTo(dir: string): string {
		return path.join(process.cwd(), dir);
	}

	/**
	 * Load ORM configuration file.
	 * @param {string} connectionName Name of the connection that will be
	 * loaded, because the configuration file might be a list of connections.
	 * @return {ConnectionOptions[]} Settings loaded, if the connection name is
	 * entered, only it will be returned.
	 */
	public static loadConfigFile(connectionName?: string): ConnectionOptions[] {

		// Default configuration file name
		const configFileName = 'coke-orm.config.json';
		const configFilePath = path.join(process.cwd(), configFileName);

		// Mount the configuration file path
		if (!fs.existsSync(configFilePath)) {
			throw new ConfigFileNotFoundError();
		}

		// Load the configuration file
		let connectionsOptions = require(configFilePath);

		// Standardize the configuration to be an array of configurations
		if (!Array.isArray(connectionsOptions)) {
			connectionsOptions = [connectionsOptions];
		}

		// Create the settings class
		for (let i = 0; i < connectionsOptions.length; i++) {
			connectionsOptions[i] = new ConnectionOptions(connectionsOptions[i]);
		}

		// If the name of the connection is entered in the method parameter, this
		// connection will be attempted, if it does not exist, an error will be
		// thrown
		if (connectionName) {
			connectionsOptions = connectionsOptions.filter((configFile: ConnectionOptions) => (configFile.name ?? 'default') == connectionName);
			if (!connectionsOptions) {
				throw new ConnectionNameDoesNotExistError(connectionName);
			}
		}

		return connectionsOptions;
	}

	/**
	 * Check if an object is empty.
	 * @param {any} value Object to be tested.
	 * @return {boolean} Indication if the object is empty.
	 */
	public static isEmpty(value: any): boolean {
		if (value) {
			return Object.keys(value).length == 0;
		}
		return true;
	}

	/**
	 * Check if an object is not empty.
	 * @param {any} value Object to be tested.
	 * @return {boolean} Indication if the object is not empty.
	 */
	public static isNotEmpty(value: any): boolean {
		return !this.isEmpty(value);
	}

	/**
	 * Removes the properties of the object passed by parameter and returns
	 * another object with the properties deleted.
	 * @param {any} originalObject Original object to remove properties.
	 * @param {string[]} propertiesToRemove Properties to be removed.
	 * @return {any} Object with deleted properties.
	 */
	public static removeObjectProperties(originalObject: any, propertiesToRemove: string[]): any {
		const object: any = {};

		for (const property of propertiesToRemove) {
			object[property] = originalObject[property];
			delete originalObject[property];
		}

		return object;
	}

	/**
	 * Fill the values in the object passed by parameter.
	 * @param {any} object Object that values will be inserted.
	 * @param {any} values Values that will be inserted into the object.
	 */
	public static fillObject(object: any, values: any): void {
		const properties: string[] = Object.keys(values);

		for (const property of properties) {
			object[property] = values[property];
		}
	}

}
