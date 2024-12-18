"use strict";
/** Convenience middleware to handle common auth cases in routes. */

import { UnauthorizedError } from "../expressError.js";
import parseTimeString from "../helpers/parseTimeString.js";
import supabase from "../lib/supabase.js";

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals.user. If invalid, attempt refresh using refresh token.
 */

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      const { data: user, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new UnauthorizedError("Invalid or expired access token"));
      }

      res.locals.user = user; // Attach user to the request
      return next();
    }
    return next(); // No access token provided
  } catch (err) {
    return next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const { data, error } = await supabase.auth.admin.refreshSession(refreshToken);

      if (error) {
        return next(new UnauthorizedError("Refresh token invalid or expired"));
      }

      res.locals.user = data.user;
      res.cookie("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseInt(process.env.REFRESH_TOKEN_DURATION, 10),
      });

      return res.json({ accessToken: data.access_token });
    }

    return next(); // No refresh token provided
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

export {
  authenticateToken,
  refreshToken,
  ensureLoggedIn,
};
