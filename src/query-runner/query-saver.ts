import * as fs from 'fs';
import * as path from 'path';

/**
 * Folder where executed queries will be saved.
 */
const QUERY_SAVE_DIRECTORY: string = 'C:\\Temp';

/**
 * Converts a parameter value to a SQL literal.
 * @param {any} value Parameter value to be converted.
 */
function toSqlLiteral(value: any): string {

	if (value == null) {
		return 'NULL';
	}

	if (typeof value == 'number' || typeof value == 'boolean') {
		return String(value);
	}

	if (value instanceof Date) {
		return `'${value.toISOString()}'`;
	}

	if (Array.isArray(value)) {
		return `'{${value.map((item) => {
			if (typeof item == 'string') {
				return `"${item.replace(/"/g, '\\"')}"`;
			}
			return item;
		}).join(',')}}'`;
	}

	if (typeof value == 'object' && Buffer.isBuffer(value)) {
		return `'\\x${value.toString('hex')}'`;
	}

	return `'${String(value).replace(/'/g, "''")}'`;

}

/**
 * Replaces the query parameters ($1, $2, ...) with their real values,
 * generating a SQL that can be executed manually in the database.
 * @param {string} query Query to have the parameters interpolated.
 * @param {any[]} params List of query parameters.
 */
export function interpolateParams(query: string, params?: any[]): string {

	if (!params || params.length == 0) {
		return query;
	}

	return query.replace(/\$(\d+)/g, (match: string, index: string) => {
		const value: any = params[parseInt(index) - 1];
		return toSqlLiteral(value);
	});

}

/**
 * Saves the executed query in a file in the C:\Temp folder, each query is
 * saved in a separate file with a name based on the date and time of
 * execution.
 * @param {string} query Query executed.
 * @param {any[]} params Query parameters.
 */
export function saveQuery(query: string, params?: any[]): void {

	const sql: string = interpolateParams(query, params);

	fs.mkdirSync(QUERY_SAVE_DIRECTORY, { recursive: true });

	const timestamp: Date = new Date();
	const pad = (value: number, length: number = 2): string => String(value).padStart(length, '0');

	const baseName: string = `query-${timestamp.getFullYear()}-${pad(timestamp.getMonth() + 1)}-${pad(timestamp.getDate())}-${pad(timestamp.getHours())}-${pad(timestamp.getMinutes())}-${pad(timestamp.getSeconds())}-${pad(timestamp.getMilliseconds(), 3)}`;
	let filePath: string = path.join(QUERY_SAVE_DIRECTORY, `${baseName}.sql`);
	let suffix: number = 1;

	while (fs.existsSync(filePath)) {
		filePath = path.join(QUERY_SAVE_DIRECTORY, `${baseName}-${suffix}.sql`);
		suffix++;
	}

	fs.writeFileSync(filePath, sql);

}