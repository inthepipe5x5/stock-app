"use strict";

import BaseModel from "./basemodel";

class Tasks extends BaseModel {
  static tableName = "Tasks";
  static defaultMapping = {
    id: "id",
    name: "name",
    description: "description",
    userId: "user_id",
    productId: "product_id",
    dueDate: "due_date",
    status: "status",
    isRecurring: "is_recurring",
    recurrenceInterval: "recurrence_interval",
    recurrenceEndDate: "recurrence_end_date",
    isAutomated: "is_automated",
    automationTrigger: "automation_trigger",
    createdBy: "created_by",
    createdDt: "created_dt",
    updatedDt: "updated_dt",
    lastUpdatedBy: "last_updated_by",
  };

  /** Find all tasks for a specific user. */
  static async findTasksByUser(userId) {
    const result = await db.query(
      `SELECT ${Object.values(this.columnMappings)} FROM ${this.tableName}
       WHERE user_id = $1 OR created_by = $1`,
      [userId]
    );
    return result.rows.map(this._mapToCamelCase);
  }
}

export default Tasks;
