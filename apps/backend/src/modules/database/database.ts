import { Database } from 'bun:sqlite';
import * as fs from 'fs';

/**
 * Initializes the database.
 * @param path - The path to the database file.
 * @param structure - The SQL query to create the database structure if it doesn't exist.
 * @returns The database instance.
 */
export function initDb(path: string, structure: string) {
  const alreadyExists = fs.existsSync(path);
  const db = new Database(path);
  if (!alreadyExists) {
    db.run(structure);
  }
  return db;
}

/**
 * Gets a single line from a table.
 * @param db - The database instance.
 * @param tableName - The name of the table.
 * @param where - A tuple containing the column and value to match.
 * @returns The first matching line.
 */
export function getLine(db: Database, tableName: string, where: [string, string]) {
  return db.query(/*sql*/ `SELECT * FROM ${tableName} WHERE ${where[0]} = ${where[1]} LIMIT 1`);
}