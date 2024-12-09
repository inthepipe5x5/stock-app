"use strict";

import db from "../db.js";
import { compare, hash } from "bcrypt";
import BaseModel from "./basemodel.js";
import sqlForConditionFilters from "../helpers/sql.js";
import { convertSnakeToCamel } from "../helpers/caseConverter.js";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../expressError.js";
import { BCRYPT_WORK_FACTOR } from "../config.js";

/** Related functions for users. */
class User extends BaseModel {
  static tableName = "Users";
  static defaultMapping = [
    "name",
    "email",
    "password",
    "oauth_provider",
    "oauth_provider_id",
    "refresh_token",
    "refresh_token_expires_at",
  ].reduce((accum, current) => {
    accum[convertSnakeToCamel(current)] = current;
  }, {});

  /** Authenticate user with email and password.
   *
   * Returns { id, name, email, oauth_provider, oauth_provider_id, refresh_token, refresh_token_expires_at }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/
  static async authenticate(email, password) {
    const result = await db.query(
      `SELECT id,
              name,
              email,
              password,
              oauth_provider,
              oauth_provider_id,
              refresh_token,
              refresh_token_expires_at
       FROM Users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid email/password");
  }

  /** Register user with data.
   *
   * Returns { id, name, email, oauth_provider, oauth_provider_id }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(newUserData) {
    if (!newUserData || newUserData === null)
      return; //do nothing if falsy data;
    else {
      try {
        //grab the pk values from the newUserData to be
        const primaryKeyMapping = Object.fromEntries(
          this.primaryKeyColumn.map((key, idx) => [
            key,
            Object.keys(newUserData).filter((key) =>
              this.primaryKeyColumn.includes(key)
            )[idx],
          ])
        );

        //check for duplicates => throws error if duplicate found
        this.duplicateCheck(this.tableName, primaryKeyMapping, true);

        const { whereClause, values } = sqlForConditionFilters(
          newUserData,
          this.defaultMapping,
          ", "
        );

        const result = await db.query(
          `INSERT INTO Users (${whereClause}) VALUES (${values.map(
            (_, i) => `$${i + 1}`
          )}) RETURNING ${whereClause}`,
          values
        );

        return result.rows[0];
      } catch (error) {
        console.error(`Error registering new user ${primaryKeyMapping}: ${e}`);
      }
    }
  }

  /** Find all users.
   *
   * Returns [{ id, name, email }, ...]
   **/
  static async findAll() {
    const result = await db.query(
      `SELECT id, name, email
       FROM Users
       ORDER BY name`
    );
    return result.rows;
  }

  /** Given a user ID, return data about user.
   *
   * Returns { id, name, email, oauth_provider, oauth_provider_id, households }
   *   where households is [{ id, name, access_level }, ...]
   *
   * Throws NotFoundError if user not found.
   **/
  static async get(id) {
    const userRes = await db.query(
      `SELECT ${Object.values(this.columnMappings)}
       FROM Users
       WHERE id = $1`,
      [id]
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${id}`);

    const userHouseholdsRes = await db.query(
      `SELECT h.id, h.name, uh.access_level
       FROM UserHouseholds uh
       JOIN Households h ON uh.household_id = h.id
       WHERE uh.user_id = $1`,
      [id]
    );

    user.households = userHouseholdsRes.rows;
    return user;
  }

  /** Update user data with `data`.
   *
   * Data can include:
   *   { name, email, password, refresh_token, refresh_token_expires_at }
   *
   * Returns { id, name, email, oauth_provider, oauth_provider_id }
   **/
  static async update(id, data) {
    if (data.password) {
      data.password = await hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForConditionFilters(data, {
      name: "name",
      email: "email",
      refreshToken: "refresh_token",
      refreshTokenExpiresAt: "refresh_token_expires_at",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE Users 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, name, email, oauth_provider, oauth_provider_id`;
    const result = await db.query(querySql, [...values, id]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);

    return user;
  }

  /** Delete given user from database; returns undefined. */
  static async remove(id) {
    const result = await db.query(
      `DELETE
       FROM Users
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);
  }

  /** Add user to a household. */
  static async joinHousehold(userId, householdId, accessLevel = "guest") {
    const householdCheck = await db.query(
      `SELECT id
       FROM Households
       WHERE id = $1`,
      [householdId]
    );
    const household = householdCheck.rows[0];
    if (!household) throw new NotFoundError(`No household: ${householdId}`);

    await db.query(
      `INSERT INTO UserHouseholds (user_id, household_id, access_level)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [userId, householdId, accessLevel]
    );
  }

  /** Remove user from a household. */
  static async leaveHousehold(userId, householdId) {
    const result = await db.query(
      `DELETE
       FROM UserHouseholds
       WHERE user_id = $1 AND household_id = $2
       RETURNING user_id`,
      [userId, householdId]
    );
    const userHousehold = result.rows[0];
    if (!userHousehold) {
      throw new NotFoundError(
        `No household ${householdId} found for user ${userId}`
      );
    }
  }
}

export default User;
