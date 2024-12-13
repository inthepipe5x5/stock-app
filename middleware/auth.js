"use strict";

/** Convenience middleware to handle common auth cases in routes. */

import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "../config/config";
import { UnauthorizedError } from "../expressError";
import { updateAccessToken } from "../helpers/tokens";
import User from "../models/user";
import parseTimeString from "../helpers/parseTimeString";

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.user (this will include the username and roleAccess field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      const decoded = verify(token, SECRET_KEY);
      const user = await User.complexFind({
        oauthProviderId: decoded.oauthProviderId,
      });
      if (!user) {
        throw new UnauthorizedError("Invalid user");
      }
      res.locals.user = decoded; // Attach decoded payload to res.locals
      return next();
    }
  } catch (err) {
    if (req.cookies.refreshToken) {
      // Try updating the access token with the refresh token
      try {
        const decodedRefreshToken = verify(
          req.cookies.refreshToken,
          SECRET_KEY
        );
        const newAccessToken = await updateAccessToken(decodedRefreshToken);
        res.json({ accessToken: newAccessToken });
        return;
      } catch (refreshErr) {
        console.error("Error refreshing token:", refreshErr);
      }
    }
    // If both fail, user is unauthenticated
    return next(); // Proceed without attaching user data
  }
};

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

export default {
  authenticateJWT,
  ensureLoggedIn,
};
