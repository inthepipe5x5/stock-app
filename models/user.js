"use strict";

const db = require("../db.js");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError.js");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** Authenticate user with email and password.
   *
   * Returns { id, name, email }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/
  static async authenticate(email, password) {
    const result = await db.query(
      `SELECT id,
              name,
              email,
              password
       FROM Users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid email/password");
  }

  /** Register user with data.
   *
   * Returns { id, name, email }
   *
   * Throws BadRequestError on duplicates.
   **/
  static async register({
    name,
    email,
    password,
    oauthProvider,
    oauthProviderId,
  }) {
    const duplicateCheck = await db.query(
      `SELECT email
       FROM Users
       WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
      : null;

    const result = await db.query(
      `INSERT INTO Users
       (name, email, password, oauth_provider, oauth_provider_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email`,
      [name, email, hashedPassword, oauthProvider, oauthProviderId]
    );

    return result.rows[0];
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
   * Returns { id, name, email, households }
   *   where households is [{ id, name }, ...]
   *
   * Throws NotFoundError if user not found.
   **/
  static async get(id) {
    const userRes = await db.query(
      `SELECT id, name, email
       FROM Users
       WHERE id = $1`,
      [id]
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${id}`);

    const userHouseholdsRes = await db.query(
      `SELECT h.id, h.name
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
   *   { name, email, password }
   *
   * Returns { id, name, email }
   **/
  static async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      name: "name",
      email: "email",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE Users 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, name, email`;
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
  static async joinHousehold(userId, householdId, isAdmin = false) {
    const householdCheck = await db.query(
      `SELECT id
       FROM Households
       WHERE id = $1`,
      [householdId]
    );
    const household = householdCheck.rows[0];
    if (!household) throw new NotFoundError(`No household: ${householdId}`);

    await db.query(
      `INSERT INTO UserHouseholds (user_id, household_id, isAdmin)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [userId, householdId, isAdmin]
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

module.exports = User;
