"use strict"

/** Routes for Products. */

import jsonschema from "jsonschema";

import { Router } from "express";
import { BadRequestError } from "../expressError";
import productsNewSchema from "../schemas/productsNew.json";
import productsUpdateSchema from "../schemas/productsUpdate.json";
import productsSearchSchema from "../schemas/productsSearch.json";

const router = Router({ mergeParams: true });

export default productsRoutes;