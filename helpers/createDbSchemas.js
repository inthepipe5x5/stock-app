import { defaultTables } from "../config/constants";
import { db as client } from "../db";
import { dbConfigObj } from "../config/config";
import { Client } from "pg";


// Helper function to create schemas
export default createDbSchemas = async (db=client) => {
  try {
    for (const tableSchema of defaultTables) {
      const query = `CREATE SCHEMA IF NOT EXISTS ${tableSchema} AUTHORIZATION ${
        dbConfigObj.DB_USERNAME || process.env.DB_USERNAME || "postgres"
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
