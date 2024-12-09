"use strict";

const BaseModel = require("./basemodel");

class ProductVendors extends BaseModel {
  static tableName = "ProductVendors";
  static columnMappings = {
    id: "id",
    name: "name",
    description: "description",
    productTypes: "product_types",
    vendorType: "vendor_type",
    status: "status",
  };

  /** Find related vendors for a given vendor ID. */
  static async findRelatedVendors(vendorId) {
    const result = await db.query(
      `SELECT pv.*
       FROM RelatedVendors rv
       JOIN ProductVendors pv ON rv.related_vendor_id = pv.id
       WHERE rv.vendor_id = $1`,
      [vendorId]
    );
    return result.rows.map(this._mapToCamelCase);
  }
}

module.exports = ProductVendors;
