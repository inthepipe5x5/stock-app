// import BaseModel from "./basemodel.js";

// /* The `UserHouseholds` class manages user households by providing methods to add users, remove users,
// and retrieve households for a specific user. */
// export default class UserHouseholds extends BaseModel {
//   static tableName = "UserHouseholds";
//   static defaultMapping = {
//     userId: "user_id",
//     householdId: "household_id",
//     access_level: "access_level",
//   };

//   static async addUserToHousehold(userId, householdId, role = "guest") {
//     //check for duplicates => returns preexisting if preexisting found
//     const duplicate = await this.duplicateCheck(
//       this.tableName,
//       { userId, householdId },
//       false
//     );

//     return duplicate ? duplicate : this.create({ userId, householdId, role });
//   }

//   static async removeUserFromHousehold(userId, householdId) {
//     return this.deleteByCompositeKey({ userId, householdId });
//   }

//   static async getHouseholdsForUser(userId) {
//     return this.findRelated({ userId }, ["household_id", "access_level"]);
//   }
// }
