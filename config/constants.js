/* A list of default table names. 
These table names to be used for testing and data management system for various purposes within the application.
By exporting this array using `export { defaultTables };`, it makes the `defaultTables` array
available for use in other parts of the codebase or in other files through import statements. */

const defaultTables = [
  "user_households", //user households joint table
  "households",
  "inventories",
  "products",
  "tasks",
  "vendors",
  "profiles",
  "related_vendors", //vendors joint table
  "task_assignments", //task assignments joint table
];

export { defaultTables };
