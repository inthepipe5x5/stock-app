"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class BaseModel {
  /** Define the table name and column mappings in the subclass */
  static tableName = null;
  static columnMappings = {};

  /** Create a new record.
   *
   * @param {Object} data - Object containing the record details.
   * @param {string} primaryKeyColumn - Column to check for duplicates.
   *
   * @returns {Object} - The newly created record.
   * @throws {BadRequestError} - If a duplicate record exists.
   */
  static async create(data, primaryKeyColumn) {
    if (!this.tableName) {
      throw new Error("Table name not defined in subclass.");
    }

    // Check for duplicates
    const duplicateCheck = await db.query(
      `SELECT ${primaryKeyColumn}
       FROM ${this.tableName}
       WHERE ${primaryKeyColumn} = $1`,
      [data[primaryKeyColumn]]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate entry: ${data[primaryKeyColumn]}`);
    }

    // Insert record
    const keys = Object.keys(data);
    const values = Object.values(data);

    const query = `
      INSERT INTO ${this.tableName}
      (${keys.join(", ")})
      VALUES (${keys.map((_, idx) => `$${idx + 1}`).join(", ")})
      RETURNING *`;

    const result = await db.query(query, values);
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

    let query = `SELECT * FROM ${this.tableName}`;
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
    const result = await db.query(query, values);
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

    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
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
  static async update(id, data) {
    if (!this.tableName) {
      throw new Error("Table name not defined in subclass.");
    }

    const { setCols, values } = sqlForPartialUpdate(data, this.columnMappings);
    const idVarIdx = `$${values.length + 1}`;

    const query = `
      UPDATE ${this.tableName}
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING *`;

    const result = await db.query(query, [...values, id]);
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
  static async remove(id) {
    if (!this.tableName) {
      throw new Error("Table name not defined in subclass.");
    }

    const result = await db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!result.rows[0]) {
      throw new NotFoundError(`No record found with id: ${id}`);
    }
  }

  /** Helper to convert snake_case to camelCase in result objects. */
  static _mapToCamelCase(row) {
    if (!row) return null;

    const mappedRow = {};
    for (let [key, value] of Object.entries(row)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      mappedRow[camelKey] = value;
    }
    return mappedRow;
  }
}

module.exports = BaseModel;
