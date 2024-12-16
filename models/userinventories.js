import BaseModel from "./basemodel";

/* The UserInventories class manages user access to inventories by providing methods to add, remove,
and retrieve inventory information for a user. */
export default class UserInventories extends BaseModel {
  static tableName = "UserInventories";
  static defaultMapping = {
    userId: "user_id",
    inventoryId: "inventory_id",
    access_level: "accessLevel",
  };

  static async addUserToInventory(userId, inventoryId, role = "guest") {
    //check for duplicates => returns preexisting if preexisting found
    const duplicate = await this.duplicateCheck(
      this.tableName,
      { userId, inventoryId },
      false
    );

    return duplicate ? duplicate : this.create({ userId, inventoryId, role });
  }

  static async removeUserFromInventory(userId, inventoryId) {
    return this.deleteByCompositeKey({ userId, inventoryId });
  }

  static async getInventorysForUser(userId) {
    return this.findRelated({ userId }, ["inventory_id", "accessLevel"]);
  }
}
