"use strict";

import db from "../db.js";
import { compare, hash } from "bcrypt";
import BaseModel from "./basemodel.js";
import sqlForConditionFilters from "../helpers/sql.js";
import {
  convertCamelToSnake,
  convertSnakeToCamel,
} from "../helpers/caseConverter.js";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../expressError.js";
import { BCRYPT_WORK_FACTOR } from "../config/config.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

  /** Authenticate user with authData object.
   *
   * Returns { id, name, email, oauth_provider, oauth_provider_id, refresh_token, refresh_token_expires_at }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/
  static async authenticate({ authData }) {
    const { email, oauthProvider, oauthProviderId, idToken } = authData;

    // Validate required fields
    const requiredKeys = ["email", "oauthProvider", "oauthProviderId", "idToken"];
    if (!requiredKeys.every((key) => key in authData)) {
      throw new BadRequestError("Invalid authentication attempt");
    }

    // Validate ID Token with the respective OAuth provider
    let isValidToken = false;
    if (oauthProvider === "google") {
      isValidToken = await this.validateGoogleToken(idToken, oauthProviderId);
    } else if (oauthProvider === "apple") {
      isValidToken = await this.validateAppleToken(idToken, oauthProviderId);
    }

    if (!isValidToken) {
      throw new UnauthorizedError("Invalid OAuth token");
    }

    // Find the user in the database
    const results = this.complexFind({ email, oauthProvider, oauthProviderId });
    const user = results.length > 0 ? results[0] : null;

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Check token expiration
    if (new Date() > user.refresh_token_expires_at) {
      throw new UnauthorizedError("Refresh token expired");
    }

    return user;
  }

  /**Google Token Validation:

    Validate the @param {*} idToken Google’s @function verifyIdToken method.
    Match the token’s sub (subject) with the oauthProviderId.
   * 
   *  
   * @param {*} expectedOauthProviderId 
   * @returns {true, false} depending on validity of token 
   */

  static async validateGoogleToken(idToken, expectedOauthProviderId) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID, // Ensure the ID token is meant for your app
      });

      const payload = ticket.getPayload();
      return payload.sub === expectedOauthProviderId; // Compare with the expected OAuth provider ID
    } catch (err) {
      console.error("Google token validation error:", err);
      return false;
    }
  }
  
  /*Apple Token Validation Function:

    Fetch Apple’s public keys from their API.
    Use the appropriate key to verify the ID token.
    Match the token’s sub with the oauthProviderId.
   @returns {true, false} depending on validity of token 

  */ 
  static async validateAppleToken(idToken, expectedOauthProviderId) {
    try {
      // Fetch Apple's public keys
      const { data: keys } = await axios.get(APPLE_PUBLIC_KEY_URL);
      const decoded = jwt.decode(idToken, { complete: true });

      if (!decoded) {
        throw new Error("Invalid Apple ID token");
      }

      const kid = decoded.header.kid;
      const appleKey = keys.keys.find((key) => key.kid === kid);

      if (!appleKey) {
        throw new Error("Apple public key not found");
      }

      const publicKey = jwt.getPublicKey(appleKey);
      const verified = jwt.verify(idToken, publicKey, {
        algorithms: ["RS256"],
      });

      return verified.sub === expectedOauthProviderId; // Compare with the expected OAuth provider ID
    } catch (err) {
      console.error("Apple token validation error:", err);
      return false;
    }
  }
}

  /** Register user with data.
   *
   * Returns { id, name, email, oauth_provider, oauth_provider_id }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(newUserData) {
    if (!newUserData || newUserData === null)
      throw new BadRequestError("Bad register request.");
    //throw bad request if falsy data;
    else {
      try {
        //grab the pk values from the newUserData to be a primary key search object
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

        //convert to snakeCaseKeys
        const snake_case_data = this._mapToSnakeCase(data);

        //create new user entry
        return this.create(snake_case_data);

        // const { whereClause, values } = sqlForConditionFilters(
        //   newUserData,
        //   this.defaultMapping,
        //   ", "
        // );

        // const result = await db.query(
        //   `INSERT INTO Users (${whereClause}) VALUES (${values.map(
        //     (_, i) => `$${i + 1}`
        //   )}) RETURNING ${whereClause}`,
        //   values
        // );
      } catch (error) {
        const errMessage = `Error registering new user ${primaryKeyMapping}: ${e}`;
        console.error(errMessage);
        throw new Error(errMessage);
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
