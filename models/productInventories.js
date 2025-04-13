"use strict";

import db from "../db.js";
import BaseModel from "./basemodel.js";

class ProductInventories extends BaseModel {
  static tableName = "ProductInventories";
  static defaultMapping = {
    id: "id",
    name: "name",
    description: "description",
    householdId: "household_id",
    category: "category",
    status: "status",
  };

  /**
   * Fetch all items for a specific inventory by `inventory_id`.
   * @param {number|number[]} inventoryId - The ID of the inventory or an array of IDs.
   * @returns {Promise<Object[]>} - A promise that resolves to an array of inventory items.
   * @throws {Error} - Throws an error if `inventoryId` is not provided.
   */
  static async getItems(inventoryId) {
    if (!inventoryId) {
      throw new Error("Inventory ID must be provided.");
    } else if (Array.isArray(inventoryId)) {
      // If inventoryId is an array, create a parameterized query with placeholders
      const placeholders = inventoryId
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const result = await db.query(
        `SELECT ${Object.values(this.defaultMapping).join(", ")}
         FROM ${this.tableName}
         WHERE inventory_id IN (${placeholders})`,
        inventoryId
      );
      return result.rows.map(this._mapToCamelCase);
    } else {
      // If inventoryId is a single value, create a parameterized query with a single placeholder
      const result = await db.query(
        `SELECT ${Object.values(this.defaultMapping).join(", ")}
         FROM ${this.tableName}
         WHERE inventory_id = $1`,
        [inventoryId]
      );
      return result.rows.map(this._mapToCamelCase);
    }
  }
}

export default ProductInventories;
