import * as fs from 'fs';
import * as path from 'path';
import { interpolateParams, saveQuery } from '../../query-runner';

describe('901 - Query saver', () => {

	describe('interpolateParams', () => {

		it('Interpolate null values', () => {
			const sql = interpolateParams('SELECT * FROM "product" WHERE "barcode" = $1', [null]);
			expect(sql).toBe('SELECT * FROM "product" WHERE "barcode" = NULL');
		});

		it('Interpolate numbers and booleans', () => {
			const sql = interpolateParams('SELECT * FROM "product" WHERE "price" = $1 AND "active" = $2', [10.5, true]);
			expect(sql).toBe('SELECT * FROM "product" WHERE "price" = 10.5 AND "active" = true');
		});

		it('Interpolate strings escaping quotes', () => {
			const sql = interpolateParams(`INSERT INTO "category" ("name") VALUES ($1)`, [`O'Brian`]);
			expect(sql).toBe(`INSERT INTO "category" ("name") VALUES ('O''Brian')`);
		});

		it('Interpolate dates', () => {
			const sql = interpolateParams('SELECT * FROM "product" WHERE "createdAt" = $1', [new Date('2026-08-19T14:30:00.000Z')]);
			expect(sql).toBe(`SELECT * FROM "product" WHERE "createdAt" = '2026-08-19T14:30:00.000Z'`);
		});

		it('Interpolate arrays', () => {
			const sql = interpolateParams('SELECT * FROM "product" WHERE "id" = ANY($1)', [[1, 2, 3]]);
			expect(sql).toBe(`SELECT * FROM "product" WHERE "id" = ANY('{1,2,3}')`);
		});

		it('Interpolate without params', () => {
			const sql = interpolateParams('SELECT * FROM "product"');
			expect(sql).toBe('SELECT * FROM "product"');
		});

	});

	describe('saveQuery', () => {

		it('Save the query in the C:\\Temp folder', () => {
			const query = `SELECT * FROM "product" WHERE "barcode" = $1`;
			saveQuery(query, ['123456789']);

			const files = fs.readdirSync('C:\\Temp').filter((file) => file.startsWith('query-') && file.endsWith('.sql'));
			expect(files.length).toBeGreaterThan(0);

			const filePath = path.join('C:\\Temp', files[files.length - 1]);
			const content = fs.readFileSync(filePath, 'utf8');
			expect(content).toBe(`SELECT * FROM "product" WHERE "barcode" = '123456789'`);
		});

	});

});
