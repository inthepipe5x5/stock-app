/**
 * Helper for creating an SQL INSERT statement.
 *
 * @param tableName {string} Name of the table to insert into.
 * @param dataToInsert {Object} Data to insert into the table.
 * @returns {Object} {sqlInsert, values}
 */
const sqlForInsert = (tableName, dataToInsert) => {
  const keys = Object.keys(dataToInsert);
  const values = Object.values(dataToInsert);

  const columns = keys.map((key) => `"${key}"`).join(", ");
  const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(", ");

  const sqlInsert = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING id`;

  return { sqlInsert, values };
};

export default sqlForInsert;
