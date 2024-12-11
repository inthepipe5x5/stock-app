"use strict";

/** Routes for authentication. */

import { validate } from "jsonschema";

import { authenticate, register } from "../models/user";
import { Router } from "express";
const router = new Router();
import { createAccessToken } from "../helpers/tokens";
import userAuthSchema from "../schemas/userAuth.json";
import userRegisterSchema from "../schemas/userRegister.json";
import { BadRequestError } from "../expressError";
import parseTimeString from "../helpers/parseTimeString";

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  const { oauthProviderId } = req.body; 

  // Create access and refresh tokens
  const accessToken = jwt.sign({ oauthProviderId }, SECRET_KEY, {
    expiresIn: parseTimeString(process.env.ACCESS_TOKEN_DURATION), 
  });
  const refreshToken = jwt.sign({ oauthProviderId }, SECRET_KEY, {
    expiresIn: parseTimeString(process.env.REFRESH_TOKEN_DURATION),
  });

  // Set refresh token as an HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents access via JavaScript
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict", // Prevents CSRF
    maxAge: parseTimeString(process.env.REFRESH_TOKEN_DURATION), // 14 days in milliseconds
  });

  // Send the access token to the client
  res.json({ accessToken });
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await register({ ...req.body, roleAccess: false });
    const token = createAccessToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

// route to refresh access tokens
app.post("/refresh", (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, SECRET_KEY);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { oauthProviderId: decoded.oauthProviderId },
      SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

export default router;
