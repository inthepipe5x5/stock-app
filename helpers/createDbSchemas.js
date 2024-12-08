import { defaultTables } from "../constants";
import { db as client } from "../db";
import { dbConfigObj } from "../config";
import { Pool } from "pg";

let db = client ? client : Pool(dbConfigObj); //if pg.client already set up, use that, else create a new pool

// Helper function to create schemas
export default createSchemas = async () => {
  try {
    for (const tableSchema of defaultTables) {
      const query = `CREATE SCHEMA IF NOT EXISTS ${tableSchema} AUTHORIZATION ${
        dbConfigObj.user || process.env.DB_USERNAME || "postgres"
      };`;
      await db.query(query);
      console.log(`Schema ${tableSchema} created or already exists.`);
    }
  } catch (err) {
    console.error("Error creating schemas:", err);
  } finally {
    await db.end();
  }
};
