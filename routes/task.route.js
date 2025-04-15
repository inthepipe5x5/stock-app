"use strict"

/** Routes for Tasks & TaskAssignments. */

import jsonschema from "jsonschema";

import { Router } from "express";
import { BadRequestError } from "../expressError.js";
import db from "../db.js";
// import Tasks from "../models/tasks";
// import taskNewSchema from "../schemas/taskNew.json";
// import taskUpdateSchema from "../schemas/taskUpdate.json";
// import taskSearchSchema from "../schemas/taskSearch.json";

const taskRoutes = Router({ mergeParams: true });

// taskRoutes.get("/:id", async (req, res, next) => {
//   try {
//     const task = await Tasks.get(req.params.id);
//     return res.json({ task });
//   } catch (err) {
//     return next(err);
//   }
// });

/** -------------------------------------------------------------------------------------------
 *  Task Assignments
 * -------------------------------------------------------------------------------------------
*/

taskRoutes.get("/assignments/:assignedUser", async (req, res, next) => {
    try {
        const { assignedUser } = req.params;

        const unauthorizedUserConditions = [
            !assignedUser,
            assignedUser !== (req?.context?.user?.id ?? req?.context?.user?.user_id),
            !req.context.user,
            !['confirmed'].includes(req?.context?.user?.["draft_status"] ?? req?.context?.user?.["draftStatus"])
        ];

        if (unauthorizedUserConditions.some(condition => condition)) {
            throw new BadRequestError("Unauthorized");
        }
        const query = `
                SELECT 
                    ta.*, 
                    t.draft_status,
                    CASE 
                    WHEN ta.created_at > NOW() - INTERVAL '1 DAY' AND ta.created_at != t.created_dt THEN 'new'
                    WHEN ta.updated_at > NOW() - INTERVAL '1 DAY' AND ta.created_at != t.created_dt THEN 'updated'
                    ELSE NULL
                    END AS assignment_type
                FROM task_assignments ta
                JOIN tasks t ON t.id = ta.task_id
                WHERE ta.user_id = $1
                    AND t.draft_status = 'confirmed'
                    AND (
                    ta.created_at > NOW() - INTERVAL '1 DAY' 
                    OR ta.updated_at > NOW() - INTERVAL '1 DAY'
                    );
                `;

        const result = await db.query(query, [req?.context?.user?.id]);

        // Process rows on the server
        const taskAssignments = result.rows.reduce(
            (acc, row) => {
                if (row.assignment_type === 'new') {
                    acc.new.push(row);
                } else if (row.assignment_type === 'updated') {
                    acc.updated.push(row);
                }
                return acc;
            },
            { new: [], updated: [] }
        );
        //add a count of each type
        const taskAssignmentCounts = {
            new: taskAssignments.new.length,
            updated: taskAssignments.updated.length
        };

        taskAssignments.counts = taskAssignmentCounts;

        return res.json({ taskAssignments });
    } catch (err) {
        return next(err);
    }
});

taskRoutes.get("/assignments/:assignedUser/:type", async (req, res, next) => {
    try {
        const { assignedUser, type } = req.params;
        const unauthorizedUserConditions = [
            !assignedUser,
            assignedUser !== (req?.context?.user?.id ?? req?.context?.user?.user_id),
            !req.context.user,
            !['confirmed'].includes(req?.context?.user?.["draft_status"] ?? req?.context?.user?.["draftStatus"])
        ];
        if (unauthorizedUserConditions.some(condition => condition)) {
            throw new BadRequestError("Unauthorized");
        }
        let query = ""
        switch (type) {
            case "new":
                query = `SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
            JOIN ON tasks t ON t.id = ta.task_id
            WHERE ta.created_at > NOW() - INTERVAL '1 DAY'
            AND ta.created_at != t.created_dt
            AND t.draft_status = 'confirmed'
            `;
                break;
            case "updated":
                query = `
        SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
        JOIN ON tasks t ON t.id = ta.task_id
        WHERE ta.updated_at > NOW() - INTERVAL '1 DAY'
        AND ta.created_at != t.created_dt
        AND t.draft_status = 'confirmed'

        `;
                break;
            case "completed":
                query = `
        SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
        JOIN ON tasks t ON t.id = ta.task_id
        WHERE ta.updated_at > NOW() - INTERVAL '1 DAY'
        AND ta.created_at != t.created_dt
        AND t.draft_status = 'confirmed'
        `;

                break;
            default:
                throw new BadRequestError("Invalid type");
        }
        const data = await db.query(query, [assignedUser]);
        const taskAssignments = {
            data: data.rows,
            count: data.rows.length ?? 0
        };

        return res.json({ taskAssignments });
    } catch (error) {
        console.error(error);
        return next(error);
    }

});
export default taskRoutes;