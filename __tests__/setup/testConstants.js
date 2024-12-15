import createExpiration from "../../helpers/createExpiration";
/** Constant Values used for testing
 *
 */

const defaultTestEnvVars = {
  SECRET_KEY: "secret-dev",
  NODE_ENV: "testing",
  HOST: "localhost",
  DB_PORT: "5432",
  DB_USERNAME: "postgres",
  DB_PW: "stringpassword",
  DB_NAME: "stockapp",
  TEST_DB_NAME: "stockapp_database",
};

/*****************************************************************************************************************
 * MOCK TEST VALUES
 *****************************************************************************************************************/

const testUser = {
  id: "1",
  name: "testuser",
  email: "testuser@test.com",
  oauthProviderId: "testuser@testTestToken",
  oauthProviderExpiresIn: createExpiration(),
};

const testData = {
  Users: [
    {
      name: "User1",
      email: "user1@example.com",
      oauth_provider: "google",
      oauth_provider_id: "google-id-1",
      oauth_provider_expires_in: createExpiration(),
    },
    {
      name: "User2",
      email: "user2@example.com",
      oauth_provider: "apple",
      oauth_provider_id: "apple-id-2",
      oauth_provider_expires_in: createExpiration(),
    },
  ],
  Households: [
    { name: "Household1", description: "Description1" },
    { name: "Household2", description: "Description2" },
  ],
  ProductInventories: [
    {
      name: "Inventory1",
      description: "Inventory Description1",
      household_id: 1,
      category: "groceries",
      status: "confirmed",
    },
    {
      name: "Inventory2",
      description: "Inventory Description2",
      household_id: 2,
      category: "toiletries",
      status: "draft",
    },
  ],
  ProductItems: [
    {
      name: "Item1",
      description: "Item Description1",
      inventory_id: 1,
      current_quantity: 10,
      unit: "kg",
      status: "confirmed",
    },
    {
      name: "Item2",
      description: "Item Description2",
      inventory_id: 2,
      current_quantity: 5,
      unit: "pcs",
      status: "draft",
    },
  ],
  ProductVendors: [
    {
      name: "Vendor1",
      description: "Vendor Description1",
      product_types: ["type1"],
      vendor_type: ["wholesaler"],
      status: "confirmed",
    },
    {
      name: "Vendor2",
      description: "Vendor Description2",
      product_types: ["type2"],
      vendor_type: ["retailer"],
      status: "draft",
    },
  ],
  RelatedVendors: [
    { vendor_id_1: 1, vendor_id_2: 2 }, // Assuming IDs will be resolved dynamically
  ],
  Tasks: [
    {
      name: "Task1",
      description: "Task Description1",
      user_id_1: 1,
      product_id_1: 1,
      due_date: "2024-12-01",
      status: "done",
      created_by_1: 1,
    },
    {
      name: "Task2",
      description: "Task Description2",
      user_id_2: 2,
      product_id_2: 2,
      due_date: "2024-12-15",
      status: "assigned",
      created_by_2: 2,
    },
  ],
  TaskAssignments: [
    { task_id_1: 1, user_id_1: 1, product_id_1: 1, created_by_1: 1 },
    { task_id_2: 2, user_id_2: 2, product_id_2: 2, created_by_2: 2 },
  ],
};

export { defaultTestEnvVars, testUser, testData };
