import { config } from "dotenv";
import { setupEnvVars, clearEnvVars } from "./jestEnvSetup.js";
import { Client } from "pg"; // Import Client from pg module
import createDbSchemas from "../../helpers/createDbSchemas.js";
import sqlForInsert from "../../helpers/sqlForInsert.js";
import getTableNames from "../../helpers/dbTables.js";
import { testData as defaultTestData, defaultTestEnvVars } from "./testConstants.js"; // Import test data


/* The TestSetUp class provides methods for setting up and tearing down Jest test environments, including optionally initializing a test database and inserting test data. */
class TestSetUp {
  static defaultTestEnvVars;
  static testData = {};

  constructor(
    customEnvValues = {},
    customTestData = defaultTestData,
    useDB = true,
    useDotEnv = true
  ) {
    // Set test data
    this.testData = {...customTestData}
    if (useDotEnv) config();

    this.envVars = { ...defaultTestEnvVars, ...customEnvValues };

    // Set environment variables
    Object.keys(this.envVars).forEach((key) => {
      process.env[key] = this.envVars[key];
    });

    // Create test DB URI
    this.testDbURI = `postgresql://${this.envVars.DB_USERNAME}:${this.envVars.DB_PW}@${this.envVars.HOST}:${this.envVars.DB_PORT}/${this.envVars.DB_NAME}`;

    // If useDB is passed in, set up DB
    if (useDB) {
      this.db = new Client({
        connectionString: this.testDbURI,
      });
      this.db.connect();
      this.initializeDb();
    }
  }

  async initializeDb() {
    // Drop all tables and recreate schemas
    const dbTableList = await getTableNames();
    for (const table of dbTableList) {
      await this.db.query(`DELETE FROM ${table}`);
    }

    await createDbSchemas(this.db);

    // Insert test data dynamically
    await this.insertTestData();

    await this.db.query("BEGIN");
  }
  //insert test data
  async insertTestData(data = this.testData) {
    for (const [tableName, records] of Object.entries(data)) {
      for (const record of records) {
        const { sqlInsert, values } = sqlForInsert(tableName, record);

        // Execute the query
        await query(sqlInsert, values);
      }
    }
  }

  beforeEachSetUp() {
    return async () => {
      setupEnvVars(this.envVars, false);
      if (this.db) {
        await this.db.query("BEGIN");
      }
    };
  }

  afterEachTearDown() {
    return async () => {
      clearEnvVars(this.envVars, false);
      if (this.db) {
        await this.db.query("ROLLBACK");
      }
    };
  }

  afterAllTearDown() {
    return async () => {
      if (this.db) {
        await this.db.end();
      }
    };
  }

  // Factory function to create setup and teardown functions
  createTestLifeCycleHooks() {
    return {
      beforeAll: async () => {
        if (!this.db || this.db === null) return; //do nothing;
        else {
          // Ensure the database is initialized
          await this.initializeDb();
        }
      },
      beforeEach: this.beforeEachSetUp(),
      afterEach: this.afterEachTearDown(),
      afterAll: this.afterAllTearDown(),
    };
  }
}

export default TestSetUp;
