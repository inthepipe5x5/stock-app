// "use strict";

// const BaseModel = require("./basemodel.js");

// class RelatedVendors extends BaseModel {
//   static tableName = "RelatedVendors";
//   static defaultMapping = {
//     vendorId: "vendor_id",
//     relatedVendorId: "related_vendor_id",
//   };

//   /** Add a related vendor relationship. */
//   static async addRelatedVendor(vendorId, relatedVendorId) {
//     const result = await db.query(
//       `INSERT INTO ${this.tableName} (vendor_id, related_vendor_id)
//        VALUES ($1, $2)
//        RETURNING *`,
//       [vendorId, relatedVendorId]
//     );
//     return this._mapToCamelCase(result.rows[0]);
//   }

//   /** Remove a related vendor relationship. */
//   static async removeRelatedVendor(vendorId, relatedVendorId) {
//     await db.query(
//       `DELETE FROM ${this.tableName}
//        WHERE vendor_id = $1 AND related_vendor_id = $2`,
//       [vendorId, relatedVendorId]
//     );
//   }
// }

// module.exports = RelatedVendors;
