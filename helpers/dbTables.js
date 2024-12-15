import { db } from "../db";
import { defaultTables } from "../config/constants";
/** Helper function for dynamically retrieving the list of tables from the database
 *
 * @param {array} tables - List of tables to retrieve. Defaults to defaultTables.
 * @returns {array} List of tables from the database
 */
const getTableNames = async (tables = defaultTables) => {
  // Convert tables to a string list to be used in query
  const tableGuardrails = tables.map((table) => `'${table}'`).join(", ");
  const queryStatement = `SELECT table_name 
                            FROM information_schema.tables 
                            WHERE table_schema='public' AND table_name IN (${tableGuardrails})`;

  try {
    const res = await db.query(queryStatement);
    const tableNames = res.rows.map((row) => row.table_name);
    return tableNames;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error to propagate it
  }
};

export default getTableNames;
