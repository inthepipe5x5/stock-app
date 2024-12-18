"use strict"

/** Routes for Households. */

import jsonschema from "jsonschema";

import { Router } from "express";
import { BadRequestError, NotFoundError } from "../expressError.js";
import householdNewSchema from "../schemas/householdNew.json";
import householdUpdateSchema from "../schemas/householdUpdate.json";
import householdSearchSchema from "../schemas/householdSearch.json";
import Household from "../models/households";
import UserHouseholds from "../models/userhouseholds";
import { search } from "./users.routes.";

const householdRoutes = Router({ mergeParams: true });

householdRoutes.get('/', async (req, res, next) => {
    try {
        const {filters} = req.body
        const households = await Household.findAll(filters)
        if (!households || households === null) throw new NotFoundError("No households found.")
        else {
            res.send({households}).status(200)
        }
        }
 catch (error) {
        return next(error)
    }
})

householdRoutes.get("/:id", async (req, res, next) => {
    try {
        const household = await Household.get(req.params.id)
        if (!household || household === null) throw new NotFoundError("No households found.");
        else {
            res.send({household}).status(200)
        }
    } catch (error) {
        return next(error)
    }
})

householdRoutes.get("/find", async (req, res, next) => {
    try {
        const {searchParams, returnRowsArray} = req.body;
        const results = await Household.complexFind(searchParams, (returnRowsArray ?? false));
        if (!results || results === null) throw new NotFoundError("No households found.");
        else {
            res.send({households: results}).status(200)
        }
    } catch (error) {
        return next(error)
    }
})


householdRoutes.patch("/patch", async (req, res, next) => {
    try {
        const {id, data} = req.body;
        const households = await Household.update(id, data, false);
        if (!households || households === null) throw new NotFoundError("No households found.");
        else {
            res.send({households}).status(201)
        }
    } catch (error) {
        return next(error)
    }
})

householdRoutes.delete("/:id", async (req, res, next) => {
    try {
        const {id} = req.body || req.query.params;
        const households = await Household.remove(id);
        if (!households || households === null) throw new NotFoundError("No households found.");
        else {
            res.send({households}).status(201)
        }
    } catch (error) {
        return next(error)
    }
})





export default householdRoutes;