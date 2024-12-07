"use strict";

const BaseModel = require("./BaseModel");

class TaskAssignments extends BaseModel {
  static tableName = "TaskAssignments";
  static columnMappings = {
    id: "id",
    taskId: "task_id",
    userId: "user_id",
    productId: "product_id",
    createdBy: "created_by",
    createdDt: "created_dt",
    updatedDt: "updated_dt",
    lastUpdatedBy: "last_updated_by",
  };

  /** Assign a user or product to a task. */
  static async assignTask(taskId, userId, productId, createdBy) {
    const result = await db.query(
      `INSERT INTO ${this.tableName} (task_id, user_id, product_id, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [taskId, userId, productId, createdBy]
    );
    return this._mapToCamelCase(result.rows[0]);
  }

  /** Get all assignments for a specific task. */
  static async findAssignmentsByTask(taskId) {
    const result = await db.query(
      `SELECT * FROM ${this.tableName}
       WHERE task_id = $1`,
      [taskId]
    );
    return result.rows.map(this._mapToCamelCase);
  }
}

module.exports = TaskAssignments;
