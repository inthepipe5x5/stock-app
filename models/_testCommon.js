// //REFACTORED INTO /__tests__/setup/test

// import { query, end } from "../db.js";
// import getTableNames from "../helpers/dbTables.js";

// // Placeholder for test data
// const testUserIds = [];
// const testHouseholdIds = [];
// const testInventoryIds = [];
// const testItemIds = [];
// const testVendorIds = [];
// const testTaskIds = [];
// const testAssignmentIds = [];

// beforeAll(async () => {
//   const dbTableList = await getTableNames();
//   for (const table of dbTableList) {
//     await db.query(`DELETE FROM ${table}`);
//   }
// });

// /** Add test data before all tests. */
// async function commonBeforeAll() {
//   //delete from db tables beforeall
//   beforeAll(async () => {
//     const dbTableList = await getTableNames();
//     for (const table of dbTableList) {
//       await db.query(`DELETE FROM ${table}`);
//     }
//   });

//   // Insert users
//   const usersRes = await query(
//     `
//     INSERT INTO Users (name, email, oauth_provider, oauth_provider_id)
//     VALUES 
//       ('User1', 'user1@example.com', 'google', 'google-id-1'),
//       ('User2', 'user2@example.com', 'github', 'github-id-2')
//     RETURNING id`
//   );
//   testUserIds.push(...usersRes.rows.map((r) => r.id));

//   // Insert households
//   const householdsRes = await query(
//     `
//     INSERT INTO Households (name, description)
//     VALUES 
//       ('Household1', 'Description1'),
//       ('Household2', 'Description2')
//     RETURNING id`
//   );
//   testHouseholdIds.push(...householdsRes.rows.map((r) => r.id));

//   // Insert UserHouseholds
//   await query(
//     `
//     INSERT INTO UserHouseholds (user_id, household_id, roleAccess)
//     VALUES 
//       ($1, $2, true),
//       ($3, $4, false)`,
//     [testUserIds[0], testHouseholdIds[0], testUserIds[1], testHouseholdIds[1]]
//   );

//   // Insert ProductInventories
//   const inventoriesRes = await query(
//     `
//     INSERT INTO ProductInventories (name, description, household_id, category, status)
//     VALUES 
//       ('Inventory1', 'Inventory Description1', $1, 'groceries', 'confirmed'),
//       ('Inventory2', 'Inventory Description2', $2, 'toiletries', 'draft')
//     RETURNING id`,
//     [testHouseholdIds[0], testHouseholdIds[1]]
//   );
//   testInventoryIds.push(...inventoriesRes.rows.map((r) => r.id));

//   // Insert ProductItems
//   const itemsRes = await query(
//     `
//     INSERT INTO ProductItems 
//     (name, description, inventory_id, current_quantity, unit, status)
//     VALUES 
//       ('Item1', 'Item Description1', $1, 10, 'kg', 'confirmed'),
//       ('Item2', 'Item Description2', $2, 5, 'pcs', 'draft')
//     RETURNING id`,
//     [testInventoryIds[0], testInventoryIds[1]]
//   );
//   testItemIds.push(...itemsRes.rows.map((r) => r.id));

//   // Insert ProductVendors
//   const vendorsRes = await query(
//     `
//     INSERT INTO ProductVendors (name, description, product_types, vendor_type, status)
//     VALUES 
//       ('Vendor1', 'Vendor Description1', ARRAY['type1'], ARRAY['wholesaler'], 'confirmed'),
//       ('Vendor2', 'Vendor Description2', ARRAY['type2'], ARRAY['retailer'], 'draft')
//     RETURNING id`
//   );
//   testVendorIds.push(...vendorsRes.rows.map((r) => r.id));

//   // Insert RelatedVendors
//   await query(
//     `
//     INSERT INTO RelatedVendors (vendor_id, related_vendor_id)
//     VALUES 
//       ($1, $2),
//       ($2, $1)`,
//     [testVendorIds[0], testVendorIds[1]]
//   );

//   // Insert Tasks
//   const tasksRes = await query(
//     `
//     INSERT INTO Tasks 
//     (name, description, user_id, product_id, due_date, status, created_by)
//     VALUES 
//       ('Task1', 'Task Description1', $1, $2, '2024-12-01', 'done', $1),
//       ('Task2', 'Task Description2', $3, $4, '2024-12-15', 'assigned', $3)
//     RETURNING id`,
//     [testUserIds[0], testItemIds[0], testUserIds[1], testItemIds[1]]
//   );
//   testTaskIds.push(...tasksRes.rows.map((r) => r.id));

//   // Insert TaskAssignments
//   const assignmentsRes = await query(
//     `
//     INSERT INTO TaskAssignments 
//     (task_id, user_id, product_id, created_by)
//     VALUES 
//       ($1, $2, $3, $2),
//       ($4, $5, $6, $5)
//     RETURNING id`,
//     [
//       testTaskIds[0],
//       testUserIds[0],
//       testItemIds[0],
//       testTaskIds[1],
//       testUserIds[1],
//       testItemIds[1],
//     ]
//   );
//   testAssignmentIds.push(...assignmentsRes.rows.map((r) => r.id));
// }

// /** Start a transaction before each test. */
// async function commonBeforeEach() {
//   await query("BEGIN");
// }

// /** Rollback the transaction after each test. */
// async function commonAfterEach() {
//   await query("ROLLBACK");
// }

// /** Close the database connection after all tests. */
// async function commonAfterAll() {
//   await end();
// }

// export default {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   testUserIds,
//   testHouseholdIds,
//   testInventoryIds,
//   testItemIds,
//   testVendorIds,
//   testTaskIds,
//   testAssignmentIds,
// };
