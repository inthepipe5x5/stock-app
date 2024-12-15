"use strict"

/** Routes for Users. */

import jsonschema from "jsonschema";

import { Router } from "express";
import { BadRequestError } from "../expressError";
import Users from "../models/user"
import usersNewSchema from "../schemas/usersNew.json";
import usersUpdateSchema from "../schemas/usersUpdate.json";
import usersSearchSchema from "../schemas/usersSearch.json";

const router = Router({ mergeParams: true });

export default householdRoutes;