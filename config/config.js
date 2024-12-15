"use strict";

/** Shared config for application; can be required many places. */

import dotenv from "dotenv";
import "colors";
// import getTableNames from "../helpers/dbTables";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const NODE_ENV = process.env.NODE_ENV || "default";
const PORT = +process.env.PORT || 3001; //app port
const HOST = +process.env.HOST || "127.0.0.1";
//db details
const DB_NAME = process.env.DB_NAME || "stockapp";
const TEST_DB_NAME = process.env.DB_NAME || "stockapp_test";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USERNAME = process.env.DATABASE_USERNAME;
const DB_PW = process.env.DB_PW;

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
const dbConfigObj = (env = NODE_ENV) => {
  const environment =
    env !== "default"
      ? ["development", "testing", "production"].includes(env.toLowerCase())
        ? env.toLowerCase()
        : "development"
      : NODE_ENV;

  return {
    host: HOST,
    dbPort: DB_PORT,
    dbUser: DB_USERNAME,
    dbPw: DB_PW,
    database: environment !== "test" ? DB_NAME : TEST_DB_NAME,
    env: environment,
  };
};

/**
 * The function `getDatabaseUri` returns a {string} database URI based on the environment and input parameters.
 * @returns The `getDatabaseUri` function returns a database URI based on the provided parameters. If
 * the `env` parameter is set to "test", it will return either the value of
 * `process.env.TEST_DATABASE_URI` or a constructed URI using the `dbUser`, `dbPw`, `host`, `dbPort`,
 * and `database` parameters. If the `env` parameter is not set
 */
const getDatabaseUri = ({ host, dbUser, dbPw, database, dbPort, env }) => {
  return env === "test"
    ? process.env.TEST_DATABASE_URI ||
        `postgresql://${dbUser}:${dbPw}@${host}:${dbPort}/${database}`
    : process.env.DATABASE_URI ||
        `postgresql://${dbUser}:${dbPw}@${host}:${dbPort}/${database}`;
};

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = NODE_ENV === "test" ? 1 : 12;

console.log("stockapp Config:".green);
console.log("NODE_ENV:".green, NODE_ENV);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log(
  "Database:".yellow,
  `${DB_NAME}`.blue,
  `=> URI: `.grey,`${getDatabaseUri(dbConfigObj(NODE_ENV))}`.blue
);
console.log("---");
//log created tables
// getTableNames()
//   .then((tables) => {
//     for (const tablename in tables) {
//       console.info(`Created `, `${tablename}`.green, ` in `, `${DB_NAME}`.blue);
//     }
//   })
//   .catch((e) => console.error(`Error getting table names: ${e}`));

export { SECRET_KEY, PORT, BCRYPT_WORK_FACTOR, getDatabaseUri, dbConfigObj };
