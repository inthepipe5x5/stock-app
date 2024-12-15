"use strict";
import dotenv from "dotenv";
import { getDatabaseUri, dbConfigObj } from "./config";
import TestSetUp from "../__tests__/setup/TestSetUp";
dotenv.config();

const customEnvValues = {
  HOST: "127.0.0.1",
  SECRET_KEY: "secret-dev",
  PORT: 5000,
  NODE_ENV: "test",
  TEST_DB_NAME: "stockapp_test",
  DB_NAME: "stockapp",
  DB_PORT: 5432, // Add DB_PORT
  DB_USERNAME: "postgres",
  DB_PW: "your_password", // Add DB_PW
  BCRYPT_WORK_FACTOR: 1, // Adjust BCRYPT_WORK_FACTOR for test environment
};

let mappedConfigValues;

const { beforeEach, afterEach } = new TestSetUp(
  customEnvValues,
  {},
  false, // disable db test functions
  true // enable dotenv
  // Initialize TestSetUp with useDB set to false and empty testData
).createTestLifeCycleHooks(); // No actual DB connection needed

describe("/config.js Configuration Tests", function () {
  beforeAll(async () => {
    await beforeEach();
    dotenv.config();
  });
  beforeEach(async () => {
    await beforeEach();
    mappedConfigValues = {
      host: customEnvValues?.HOST,
      dbPort: customEnvValues?.DB_PORT,
      dbUser: customEnvValues?.DB_USERNAME,
      dbPw: customEnvValues?.DB_PW,
      database:
        customEnvValues?.NODE_ENV !== "test"
          ? customEnvValues?.DB_NAME
          : customEnvValues?.TEST_DB_NAME,
      env: customEnvValues?.NODE_ENV,
    };
  });
  afterEach(async () => await afterEach());

  test("Environment variables can be read correctly", function () {
    for (let envKey in customEnvValues) {
      expect(process.env[envKey]).toEqual(`${customEnvValues[envKey]}`);
    }
  });

  test("dbConfigObj returns correct configuration object", function () {
    expect(dbConfigObj(customEnvValues?.NODE_ENV)).toEqual(mappedConfigValues);
  });

  test("getDatabaseUri returns correct URI", function () {
    const expectedUri = `postgresql://${customEnvValues.DB_USERNAME}:${customEnvValues.DB_PW}@${customEnvValues.HOST}:${customEnvValues.DB_PORT}/${customEnvValues.TEST_DB_NAME}`;
    expect(getDatabaseUri(mappedConfigValues)).toEqual(expectedUri);

    // Set NODE_ENV to 'other' and check the database URI again
    process.env.NODE_ENV = "other";
    const otherEnvConfig = dbConfigObj("other");
    const otherExpectedUri = `postgresql://${customEnvValues.DB_USERNAME}:${customEnvValues.DB_PW}@${customEnvValues.HOST}:${customEnvValues.DB_PORT}/${customEnvValues.DB_NAME}`;
    expect(getDatabaseUri(otherEnvConfig)).toEqual(otherExpectedUri);
  });
});
