"use strict"

/** Routes for Tasks & TaskAssignments. */

import jsonschema from "jsonschema";

import { Router } from "express";
import { BadRequestError } from "../expressError.js";
import Tasks from "../models/tasks";
import taskNewSchema from "../schemas/taskNew.json";
import taskUpdateSchema from "../schemas/taskUpdate.json";
import taskSearchSchema from "../schemas/taskSearch.json";

const router = Router({ mergeParams: true });

export default taskRoutes;