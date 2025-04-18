"use strict";
import { user } from "pg/lib/defaults.js";
import db from "../db.js";
/** Convenience middleware to handle common auth cases in routes. */

import { UnauthorizedError } from "../expressError.js";
import parseTimeString from "../helpers/parseTimeString.js";
// import { validateSupabaseToken } from "../helpers/tokens.js";
import supabase from "../lib/supabase.js";

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals.user. If invalid, attempt refresh using refresh token.
 */

const authenticateToken = async (req, res, next) => {
  //TODO: only need a test here
  try {
    const apiKey = req.headers["x-api-key"];

    // Handle App-level authentication
    if (apiKey) {
      if (apiKey === process.env.BACKEND_API_KEY) {
        req.isAppRequest = true;
        // Set the user context for app-level requests
        req.context = {
          user: req?.body?.user
        }
        return next();
      } else {
        return next(new UnauthorizedError("Invalid API key"));
      }
    }
    const authHeader = req.headers["authorization"];
    const token =
      authHeader?.replace(/^[Bb]earer /, "").trim() ??
      req?.cookies?.token ??
      req?.body?.token ?? null

    if (!!token) {
      const { data: user, error: userError } = await supabase.auth.getUser(
        token
      );
      console.log("data access token received. Received Supabase base user", { user, error });
      //handle errors & no data found from token
      if (!!!user || !!userError) {
        return next(new UnauthorizedError(userError?.message ?? "Invalid access credentials"));
      }
      //extract user id from auth.users
      const { id: user_id, ...userAuthData } = user;
      //attach token to request
      const reqContext = {
        user: { user_id, email: userAuthData?.email },
        auth: userAuthData,
        token,
      };
      console.info("reqContext:", reqContext);
      req.context = reqContext;
      return next();
    }
    // No access token provided
    throw new UnauthorizedError("No access token provided");
    //return next();
  } catch (err) {
    return next(err);
  }
};

/** Middleware to attach db table information to req.context.
 * To be called after @function authenticateToken.
 * 
 */
export const attachAuthData = async (req, res, next) => {
  try {
    const userId = req.body?.user_id ?? req?.context?.user?.user_id;

    if (req.context?.user?.user_id && Object.values(req?.context ?? {}).length > 2) {
      // If user_id & profiles information is already in context, skip this step
      return next();
    }
    const { data: auth, error } = await supabase.auth.admin.getUserById(userId);

    if (!!error) {
      return next(new UnauthorizedError("Invalid user ID"));
    }

    const userData = await db.query(
      `SELECT 1 FROM profiles WHERE profiles.user_id = $1
      `,
      [userId]
    );

    if (userData.rows.length === 0) {
      throw new UnauthorizedError("User not found");
    }

    // Attach user_id to req.context
    req.context = {
      ...req.context,
      user: userData?.rows?.[0],
      auth,
    };
    return next();
  } catch (err) {
    return next(err);

  };
}

/** Middleware to ensure user is logged in.
 *
 * If not, raises Unauthorized.
 */
const ensureLoggedIn = async (req, res, next) => {
  try {
    if (!res.locals.user) {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        const { data, error } = await supabase.auth.admin.refreshSession(
          refreshToken
        );

        if (error) {
          throw new UnauthorizedError("User not authenticated");
        }

        res.locals.user = data.user;
        res.cookie("refresh_token", data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: parseTimeString(process.env.REFRESH_TOKEN_DURATION),
        });
        return next();
      }
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

export { authenticateToken, ensureLoggedIn };
