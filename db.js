"use strict";
/** Database setup for stockapp. */
import { Client } from "pg";
import { getDatabaseUri, dbConfigObj } from "./config/config";

let db;
let ENV = process.env.NODE_ENV;
if (ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(dbConfigObj(ENV)),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri(dbConfigObj(ENV)),
  });
}

db.connect()
  // .then(() => console.log(`Connected to the database: ${process.env.DB_NAME}`))
  // .catch((err) =>
  //   console.error(
  //     `Error connecting to the database: ${process.env.DB_NAME}`,
  //     err
  //   )
  // );

export default db;
