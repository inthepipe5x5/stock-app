"use strict";
/** Convenience middleware to handle common auth cases in routes. */

import { UnauthorizedError } from "../expressError.js";
import parseTimeString from "../helpers/parseTimeString.js";
import { validateSupabaseToken } from "../helpers/tokens.js";
import supabase from "../lib/supabase.js";

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals.user. If invalid, attempt refresh using refresh token.
 */

const authenticateToken = async (req, res, next) => {
  //TODO: only need a test here
  try {
    const token =
      req.headers.authorization.replace(/^[Bb]earer /, "").trim() ||
      req.cookies.token ||
      req.body.token;

    if (token) {
      const user = validateSupabaseToken(token);
      console.log("data access token received", data);
      //handle errors & no data found from token
      if (user === null || !user) {
        return next(new UnauthorizedError("Invalid or expired access token"));
      }
      //extract user id from auth.users
      const { id: user_id } = user;
      //attach token to request
      const reqContext = {
        user: user_id,
        auth: user,
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
