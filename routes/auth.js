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

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await authenticate(username, password);
    const token = createAccessToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
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
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await register({ ...req.body, is_admin: false });
    const token = createAccessToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


export default router;
