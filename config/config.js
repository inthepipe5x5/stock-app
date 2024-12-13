"use strict";

/** Shared config for application; can be required many places. */

import {config} from "dotenv"
import "colors";
import getTableNames from "../helpers/dbTables"

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001; //app port
const HOST = +process.env.HOST || "127.0.0.1";
//db details
const DB_NAME = process.env.DB_NAME || "stockapp";
const TEST_DB_NAME = process.env.DB_NAME || "stockapp_test";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USERNAME = process.env.DATABASE_USERNAME;
const DB_PW = process.env.DB_PW;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URI ||
        `postgresql://${DB_USERNAME}:${DB_PW}@${HOST}:${DB_PORT}/${DB_NAME}`
    : process.env.DATABASE_URI ||
        `postgresql://${DB_USERNAME}:${DB_PW}@${HOST}:${DB_PORT}/${TEST_DB_NAME}`;
}

/**
 * The function `dbConfigObj` returns a configuration object for a database connection based on the
 * environment provided.
 * @param [env=default] - The `env` parameter is used to determine the environment configuration to be
 * used. It defaults to 'default' if not specified.
 * @returns The function `dbConfigObj` returns an object with properties `host`, `port`, `user`,
 * `password`, and `database`. The values for these properties are variables `HOST`, `PORT`,
 * `DB_USERNAME`, `DB_PW`, and either `DB_NAME` or `TEST_DB_NAME` based on the condition `env !==
 * 'test'`.
 */
const dbConfigObj = (env = "default") => {
  env !== "default" ? env : "development";

  return {
    host: HOST,
    port: PORT,
    user: DB_USERNAME,
    password: DB_PW,
    database: env !== "test" ? DB_NAME : TEST_DB_NAME,
  };
};
// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("stockapp Config:".green);
console.log("NODE_ENV:".green, process.env.NODE_ENV);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log(
  "Database:".yellow,
  `${DB_NAME}`.blue,
  `=> URI: ${getDatabaseUri()}`.grey
);
console.log("---");
//log created tables
getTableNames()
  .then((tables) => {
    for (const tablename in tables) {
      console.info(`Created ${tablename} in ${DB_NAME}`);
    }
  })
  .catch((e) => console.error(`Error getting table names: ${e}`));

export {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  dbConfigObj,
};
