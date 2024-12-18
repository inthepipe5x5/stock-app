"use strict";

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

  /** Fetch all items for a specific inventory by `inventory_id`. */
  static async getItems(inventoryId) {
    const result = await db.query(
      `SELECT ${Object.values(this.columnMappings)}
       FROM ProductItems
       WHERE inventory_id = $1`,
      [inventoryId]
    );

    return result.rows.map(this._mapToCamelCase);
  }
}

export default ProductInventories;
