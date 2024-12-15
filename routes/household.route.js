"use strict"

/** Routes for Households. */

import jsonschema from "jsonschema";

import { Router } from "express";
import { BadRequestError } from "../expressError";
import householdNewSchema from "../schemas/householdNew.json";
import householdUpdateSchema from "../schemas/householdUpdate.json";
import householdSearchSchema from "../schemas/householdSearch.json";

const router = Router({ mergeParams: true });

export default householdRoutes;