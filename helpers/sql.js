import { BadRequestError } from "../expressError.js";

/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names,
 *   like { firstName: "first_name", age: "age" }
 * @param filterSeparator {string} defaults to " AND " for combining multiple WHERE clauses (ie. for filtering), or use ", " for updating
 *
 * @returns {Object} {sqlSetCols, dataToUpdate}
 *
 * @example {firstName: 'Aliya', age: 32} =>
 *   { whereClause: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32] }
 */

const sqlForConditionFilters = (
  dataToFilter,
  jsToSql,
  filterSeparator = " AND "
) => {
  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) throw new BadRequestError("No filters provided");

  const filters = keys.map(
    (key, idx) => `"${jsToSql[key] || key}"=$${idx + 1}`
  );

  return {
    whereClause: filters.join(filterSeparator),
    values: Object.values(dataToFilter),
  };
};

export default sqlForConditionFilters;
