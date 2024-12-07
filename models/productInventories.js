"use strict";

const BaseModel = require("./BaseModel");

class ProductInventories extends BaseModel {
  static tableName = "ProductInventories";
  static columnMappings = {
    id: "id",
    name: "name",
    description: "description",
    householdId: "household_id",
    category: "category",
    status: "status",
  };

  /** Fetch all items for a specific inventory by `inventory_id`. */
  static async getItems(inventoryId) {
    const result = await db.query(
      `SELECT *
       FROM ProductItems
       WHERE inventory_id = $1`,
      [inventoryId]
    );

    return result.rows.map(this._mapToCamelCase);
  }
}

module.exports = ProductInventories;
