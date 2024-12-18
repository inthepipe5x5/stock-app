"use strict";

import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import {
  convertCamelToSnake,
  convertSnakeToCamel,
} from "../helpers/caseConverter.js";
import sqlForConditionFilters from "../helpers/sql.js";

const { query: _query } = db;

/* The above class `BaseModel` provides methods for interacting with a database table, including
creating, finding, updating, and deleting records, as well as handling duplicates and complex
queries. */
export default class BaseModel {
  /** Define the table name and column mappings in the subclass */
  static dbSchema = "public"; //default schema that tables will be stored under
  static tableName = null;
  static defaultMapping = {};
  static columnMappings = (async () => {
    return await this.createColumnMapping();
  })();

  static primaryKeyColumn = (async () => {
    return await this.getPrimaryKeyColumns();
  })();

  /** Create a new record.
   *
   * @param {Object} data - Object containing the record details.
   * @param {string} primaryKeyColumn - Column to check for duplicates.
   *
   * @returns {Object} - The newly created record.
   * @throws {BadRequestError} - If a duplicate record exists.
   */
  static async create(data, handleConflictWithUpdate = false) {
    if (!this.tableName) {
      return; //do nothing if not a subclass or falsy tableName
    }

    // Check for duplicates //TODO: replace this this.duplicateCheck() later
    const primaryKeyMapping = Object.fromEntries(
      this.primaryKeyColumn.map((key, idx) => [
        key,
        Object.keys(data).filter((key) => this.primaryKeyColumn.includes(key))[
          idx
        ],
      ])
    );

    //check for duplicates => throws error if duplicate found
    await this.duplicateCheck(this.tableName, primaryKeyMapping, true);

    //generate whereClauses, values for dynamic query string
    const { whereClause, values } = sqlForConditionFilters(
      data,
      this.defaultMapping,
      ", "
    );

    // Insert record
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${whereClause}) VALUES (${values.map(
        (_, i) => `$${i + 1}`
      )}) RETURNING ${whereClause}
      ON CONFLICT DO ${handleConflictWithUpdate ? "UPDATE" : "NOTHING"}`,
      values
    );
    return this._mapToCamelCase(result.rows[0]);
  }

  /** Find all records with optional filters.
   *
   * @param {Object} filters - Filters for querying the table.
   *
   * @returns {Array<Object>} - List of matching records.
   */
  static async findAll(filters = {}) {
    if (!this.tableName) {
      throw new Error("Table name not defined in subclass.");
    }

    let query = `SELECT ${Object.values(this.columnMappings)} FROM ${
      this.tableName
    }`;
    let whereClauses = [];
    let values = [];

    for (let [key, value] of Object.entries(filters)) {
      values.push(value);
      whereClauses.push(`${key} = $${values.length}`);
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY id"; // Customize the sort column if necessary
    const result = await _query(query, values);
    return result.rows.map(this._mapToCamelCase);
  }

  /** Get a record by its primary key.
   *
   * @param {number|string} id - The primary key value.
   *
   * @returns {Object} - The matching record.
   * @throws {NotFoundError} - If the record is not found.
   */
  static async get(id) {
    if (!this.tableName) {
      throw new Error("Table name not defined in subclass.");
    }

    const result = await _query(
      `SELECT ${Object.values(this.columnMappings)} FROM ${
        this.tableName
      } WHERE id = $1`,
      [id]
    );

    const record = result.rows[0];
    if (!record) {
      throw new NotFoundError(`No record found with id: ${id}`);
    }

    return this._mapToCamelCase(record);
  }

  /** Update a record with partial data.
   *
   * @param {number|string} id - The primary key value.
   * @param {Object} data - The partial data for updating.
   *
   * @returns {Object} - The updated record.
   * @throws {NotFoundError} - If the record is not found.
   */
  static async update(id, data, handleConflictWithInsert = true) {
    if (!this.tableName) {
      throw new Error("Table name not defined in subclass.");
    }

    const { setCols, values } = sqlForConditionFilters(
      data,
      this.columnMappings
    );
    const idVarIdx = `$${values.length + 1}`;

    const query = `
      UPDATE ${this.tableName}
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING ${setCols}
      ON CONFLICT DO ${handleConflictWithInsert ? "INSERT" : "NOTHING"}
      `;

    const result = await _query(query, [...values, id]);
    const record = result.rows[0];

    if (!record) {
      throw new NotFoundError(`No record found with id: ${id}`);
    }

    return this._mapToCamelCase(record);
  }

  /** Delete a record by its primary key.
   *
   * @param {number|string} id - The primary key value.
   *
   * @throws {NotFoundError} - If the record is not found.
   */
  static async deleteByID(id) {
    if (!this.tableName) {
      throw new Error("Table name not defined in subclass.");
    }

    const result = await _query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!result.rows[0]) {
      throw new NotFoundError(`No record found with id: ${id}`);
    }
  }

  /**
   * The function `complexDelete` performs a complex delete operation based on the input parameters
   * provided.
   * @param deleteParamObj - The `deleteParamObj` parameter in the `complexDelete` method is an object
   * that contains the criteria for deleting records from a database table. It is used to generate the
   * WHERE clause for the DELETE statement. The keys of this object should correspond to columns in the
   * database table, and the values are the search values to filter by
   * @returns The `complexDelete` method returns the first row of the result set after executing the
   * DELETE query. If no rows are deleted, it throws a `NotFoundError` with the message "No matching
   * record found to delete."
   */
  static async complexDelete(deleteParamObj) {
    // Validate input and ensure tableName is defined
    if (
      !this.tableName ||
      !deleteParamObj ||
      !Object.keys(deleteParamObj).every((key) => key in this.columnMappings)
    ) {
      return;
    }

    // Generate WHERE clause and values
    const { setCols: whereClause, values: searchValues } =
      sqlForConditionFilters(deleteParamObj, this.columnMappings);

    // Construct the DELETE statement
    const queryStatement = `
      DELETE FROM ${this.tableName}
      WHERE ${whereClause}
      RETURNING ${Object.values(this.columnMappings)}`;

    // Execute the query
    const result = await _query(queryStatement, searchValues);

    // Handle no rows being deleted
    if (!result.rows.length) {
      throw new NotFoundError("No matching record found to delete.");
    }

    return result.rows[0];
  }
  static async complexFind(searchParams, returnRowsArray = false) {
    // Validate input and ensure tableName is defined
    if (
      !this.tableName ||
      !searchParams ||
      !Object.keys(searchParams).every((key) => key in this.columnMappings)
    ) {
      return [];
    }

    // Generate WHERE clause and values
    const { setCols: whereClause, values: searchValues } =
      sqlForConditionFilters(searchParams, this.columnMappings, " AND ");

    // Construct the SELECT statement
    const queryStatement = `
      SELECT ${Object.values(this.columnMappings)} FROM ${this.tableName}
      WHERE ${whereClause}`;

    // Execute the query
    const result = await _query(queryStatement, searchValues);

    return returnRowsArray ? result.rows : result.rows[0];
  }

  /** Helper to convert snake_case to camelCase in result objects. */
  static _mapToCamelCase(row) {
    if (!row) return null;

    const mappedRow = {};
    for (let [key, value] of Object.entries(row)) {
      const camelKey = convertCamelToSnake(key);
      mappedRow[camelKey] = value;
    }
    return mappedRow;
  }
  /**
   * Helper to convert camelCase to snake_case in result objects.
   * NOTE: this is already handled by sqlForConditionFilters () because ths.columnMappings
   * @param {Object} newRow - The object to convert.
   * @returns {Object} The converted object.
   */
  static _mapToSnakeCase(newRow) {
    if (!newRow) return null;

    const mappedRow = {};
    for (let [key, value] of Object.entries(newRow)) {
      const snakeKey = convertSnakeToCamel(key);
      mappedRow[snakeKey] = value;
    }
    return mappedRow;
  }
  /**Function to return the column names from the database.
   * Uses pg_ tables instead of querying 'information_schema' directly which is dependent on user permissions.
   *
   * @param {*} tableName - name of the table being queried
   * @returns array of the column names (@type Array[String])
   */
  static async getColumnNames(tableName) {
    try {
      const result = await BaseModel.pool.query(
        `SELECT a.attname AS column_name
       FROM pg_catalog.pg_attribute a
       JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
       JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
       WHERE c.relname = $1 AND n.nspname = $2 AND a.attnum > 0
       ORDER BY a.attnum`,
        [tableName, this.dbSchema]
      );
      const columnNames = result.rows.map((row) => row.column_name);
      return columnNames;
    } catch (err) {
      console.error(err);
    }
  }

  static async createColumnMapping(defaultMapping = {}) {
    //guard clause if called on parent
    if ((this.tableName === null) | !this.tableName) return;
    else {
      const column_names = await BaseModel.getColumnNames(this.tableName);
      //db is set up with tables
      if (column_names) {
        const mappingOutput = {};
        for (col in column_names) {
          let columnName = convertSnakeToCamel(col);
          mappingOutput[columnName] = col;
        }
        //update columnMapping & default mapping property
        this.columnMappings = mappingOutput;
        this.defaultMapping = mappingOutput;
        return mappingOutput;
      } else {
        return defaultMapping; //return default mapping dict if db table information is not set up yet
      }
    }
  }

  static async getIndexes(tableName) {
    /*Helper function to get the indexes for this table*/
    if (!tableName || tableName === null)
      return; //do nothing if falsy tableName ie. for the BaseModel class
    else {
      try {
        const result = await db.query(
          `SELECT i.relname AS index_name
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_catalog.pg_index ix ON c.oid = ix.indexrelid
        JOIN pg_catalog.pg_class i ON ix.indexrelid = i.oid
        WHERE c.relname = $1 AND n.nspname = $2 AND ix.indisprimary = false AND ix.indisunique = false`,
          [tableName]
        );
        if (result.rows.length === 0) {
          console.log(`No indexes found for table ${tableName}`);
          return []; // or throw an error, depending on your needs
        }
        const indexNames = result.rows.map((row) => row.index_name);
        return indexNames;
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Function to get primary key columns for a table
  static async getPrimaryKeyColumns(tableName = this.tableName) {
    if (!tableName || tableName === null)
      return; //do nothing if falsy/null tableName
    else {
      const result = await _query(
        `SELECT a.attname
                                      FROM pg_index i
                                      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                                      WHERE i.indrelid = '$1'::regclass AND i.indisprimary`,
        [tableName]
      );

      return result.rows.map((row) => row.attname);
    }
  }
  /**
   * This function checks for duplicates in a database table based on primary keys and throws an error if
   * a duplicate is found.
   * @param primaryKeysObj - The `primaryKeysObj` parameter is an object that contains the primary key
   * values to check for duplicates in the database table. It is used to query the database and determine
   * if there are any existing records with the same primary key values.
   * @param [tableName] - The `tableName` parameter in the `duplicateCheck` method is used to specify the
   * name of the table in the database where the duplicate check will be performed. If a `tableName` is
   * provided, the method will check for duplicates in that specific table. If no `tableName` is provided
   * or if
   * @param [throwErrorIfDuplicate=true] - The `throwErrorIfDuplicate` parameter is a boolean flag that
   * determines whether an error should be thrown if a duplicate entry is found in the database. If
   * `throwErrorIfDuplicate` is set to `true`, the method will throw a `BadRequestError` with a message
   * indicating that a duplicate entry
   * @returns If a duplicate entry is found and `throwErrorIfDuplicate` is set to true, a
   * `BadRequestError` with the message "Duplicate found: [duplicate entry details]" will be thrown.
   * Otherwise, the first duplicate entry found will be returned.
   */
  static async duplicateCheck(
    primaryKeysObj,
    tableName = this.tableName,
    throwErrorIfDuplicate = true
  ) {
    if (!tableName || tableName === null) return; //do nothing if falsy/null tableName

    const duplicateQuery = await BaseModel.complexFind(primaryKeysObj, false);

    if (duplicateQuery.rows[0] && throwErrorIfDuplicate) {
      throw new BadRequestError(`Duplicate found: ${duplicateQuery.rows[0]}`);
    } else {
      return duplicateQuery.rows[0];
    }
  }

  /** Fetch related records from a join table.
   *
   * @param {Object} keys - The keys to filter the join table.
   * @param {string[]} returnColumns - The columns to select.
   *
   * @returns {Array<Object>} - The related records.
   */
  static async findRelated(keys, returnColumns = []) {
    if (!this.tableName) {
      // throw new Error("Table name not defined in subclass.");
      return; //do nothing if falsy tableName
    }

    const { whereClause, values } = sqlForConditionFilters(
      keys,
      this.columnMappings,
      " AND "
    );
    const selectColumns = returnColumns.length ? returnColumns.join(", ") : "*";

    const query = `SELECT ${selectColumns} FROM ${this.tableName} WHERE ${whereClause}`;
    const result = await _query(query, values);

    return result.rows.map(this._mapToCamelCase);
  }

  /** Get a record by its composite key.
   *
   * @param {Object} keys - The composite keys for the record.
   *
   * @returns {Object} - The matching record.
   * @throws {NotFoundError} - If the record is not found.
   */
  static async getByCompositeKey(keys) {
    if (!this.tableName) {
      // throw new Error("Table name not defined in subclass.");
      return; //do nothing if falsy tableName
    }

    const { whereClause, values } = sqlForConditionFilters(
      keys,
      this.columnMappings,
      " AND "
    );

    const query = `SELECT ${Object.values(this.columnMappings)} FROM ${
      this.tableName
    } WHERE ${whereClause}`;
    const result = await _query(query, values);

    if (!result.rows[0]) {
      throw new NotFoundError("No record found with provided keys.");
    }

    return this._mapToCamelCase(result.rows[0]);
  }

  /** Delete a record by its composite key. USE FOR JOIN TABLES
   *
   * @param {Object} keys - The composite keys for the record.
   *
   * @throws {NotFoundError} - If the record is not found.
   */
  static async deleteByCompositeKey(keys) {
    if (!this.tableName) {
      // throw new Error("Table name not defined in subclass.");
      return; //do nothing if falsy tableName
    }

    const { whereClause, values } = sqlForConditionFilters(
      keys,
      this.columnMappings,
      " AND "
    );

    const query = `DELETE FROM ${this.tableName} WHERE ${whereClause} RETURNING *`;
    const result = await _query(query, values);

    if (!result.rows[0]) {
      throw new NotFoundError("No record found with provided keys.");
    }

    return this._mapToCamelCase(result.rows[0]);
  }
}
