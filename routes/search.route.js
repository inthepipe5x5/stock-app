import { Router } from "express";
import { BadRequestError } from "../expressError.js";
import db from "../db.js";
import { checkSelectQueryParams } from "../middleware/query.js";

const searchRoutes = Router({ mergeParams: true });
searchRoutes.use(checkSelectQueryParams)

searchRoutes.post('/households', async (req, res, next) => {
    try {
        const { searchTerm } = req.body;
        const { select, from, join, } = req.query || req.body;
        const { limit = 10 } = req.query || req.body

        if (!searchTerm) {
            return res.status(400).json({ error: "Search term is required" });
        }

        const query = `
            SELECT * FROM households as h
            WHERE 
                (LOWER(h.name) ILIKE LOWER($1) OR LOWER(h.description) LIKE LOWER($1) OR LOWER(h.initial_template_name) LIKE LOWER($1))
                AND draft_status = 'confirmed'
                ${join ? "AND id NOT IN (SELECT household_id FROM user_households as uh WHERE uh.user_id = $2)" : ""}
            ORDER BY h.name DESC
            ${!!limit ? `LIMIT ${limit?.[0] ?? limit ?? 10}` : ""}
        `;
        const results = await db.query(query, [`%${searchTerm}%`, req?.context?.user?.id]);
        if (results?.rows?.length === 0) {
            return res.status(404).json({ error: "No households found" });
        }
        if (results?.rows?.length === 1) {
            return res.status(200).json({ household: results.rows[0] });
        }
        return res.json({ results });
    } catch (err) {
        return next(err);
    }
});

searchRoutes.post('/users', async (req, res, next) => {
    try {
        const { searchTerm } = req.body;
        const { limit = 10 } = req.query || req.body;

        if (!searchTerm) {
            return res.status(400).json({ error: "Search term is required" });
        }

        const query = `
            SELECT * FROM profiles as p
            WHERE 
                (LOWER(p.first_name) ILIKE LOWER($1) OR LOWER(p.last_name) LIKE LOWER($1) OR LOWER(p.email) LIKE LOWER($1))
                AND draft_status = 'confirmed'
            ORDER BY p.first_name DESC
            LIMIT $2
        `;

        const results = await db.query(query, [`%${searchTerm}%`, limit]);
        return res.json({ results });
    } catch (err) {
        return next(err);
    }
});

searchRoutes.post('/tasks', async (req, res, next) => {
    try {
        const { searchTerm = "" } = req.query || req.body;
        const { limit, join, draft_status, completion_status, order } = req.query || req.body || null;


        if (!!!searchTerm) {
            return res.status(400).json({ error: "Search term is required" });
        }

        let draftQuery = "";
        switch (draft_status) {
            case (typeof draft_status === "string" && draft_status.startsWith("!")):
                draftQuery = `AND t.draft_status != $1`;
                break;
            case (typeof draft_status === "string" && !draft_status.startsWith("!")):
                draftQuery = `AND t.draft_status = $1`;
                break;
            case (typeof draft_status === "string" && !draft_status.startsWith("!(" && draft_status.endsWith(")"))):
                draftQuery = `AND t.draft_status NOT IN $1`;
                break;
            case (Array.isArray(draft_status) && draft_status.length > 0):
                draftQuery = `AND t.draft_status IN (${draft_status.map((_, i) => `$${i + 1}`).join(", ")})`;
                break;
            default:
                draftQuery = "AND task.draft_status = 'confirmed'";
        }


        const query = `
        SELECT 
        ta.assigned_by as assigned_by,
        ta.user_id as assigned_to,
        ta.updated_at as assignment_updated_at,
        ta.created_at as assigned_to_at,
        prod.product_name as product_name,

        t.id as task_id,
        t.task_name as task_name,
        t.due_date as task_due_date,
        t.description as task_description,
        t.created_at as task_created_at,
        t.updated_dt as task_updated_at,
        t.draft_status as task_draft_status,
        t.completion_status as task_completion_status,
        t.created_by as task_created_by,
        t.last_updated_by as task_updated_by,
        t.updated_dt as task_updated_dt,
        t.automation_trigger as task_automation_trigger,
        t.recurrence_interval as task_recurrence_interval,
        t.recurrence_end_date as task_recurrence_end_date,
        t.is_template as task_is_template,
         FROM tasks as t
        WHERE 
        (LOWER(t.task_name) LIKE LOWER($1) OR LOWER(t.description) LIKE LOWER($1) OR LOWER(t.completion_status) ${!!join && join.includes('products') ? "OR LOWER(prod.product_name) LIKE LOWER($1) OR OR LOWER(prod.description) LIKE LOWER($1)" : ""}) 
        JOIN task_assignments ta ON ta.task_id = tasks.id AND ta.user_id = $2
        ${Array.isArray(completion_status ?? null) && completion_status.length > 0 ? `AND t.completion_status IN (${completion_status.map((_, i) => `$${i + 1}`).join(", ")})` : typeof completion_status === "string" ? `AND t.completion_status = $1` : ""}
        ${!!join && join.includes('products') ? "JOIN products prod ON prod.id = t.product_id" : ""}
        ${draftQuery}
        ORDER BY t.${order ?? "due_date"}
        ${!!limit ? `LIMIT ${limit?.[0] ?? limit ?? 10}` : ""}
        `;
        const results = await db.query(query,
            [`%${searchTerm}%`,
            req?.context?.user?.id]);
        return res.json({ results });
    } catch (err) {
        return next(err);
    }
});

searchRoutes.post('/products', async (req, res, next) => {
    try {

        const household_id = req?.context?.households?.[0]?.id ?? req?.body?.household_id ?? null;
        const { searchTerm = "" } = req.query || req.body;
        const { select, limit, join, draft_status, completion_status, order, template } = req.query || req.body || null;

        if (!!!searchTerm) {
            return res.status(400).json({ error: "Search term is required" });
        }
        let draftQuery = "";
        switch (draft_status) {
            case (typeof draft_status === "string" && draft_status.startsWith("!")):
                draftQuery = `AND prod.draft_status != $1`;
                break;
            case (typeof draft_status === "string" && !draft_status.startsWith("!")):
                draftQuery = `AND prod.draft_status = $1`;
                break;
            case (typeof draft_status === "string" && !draft_status.startsWith("!(" && draft_status.endsWith(")"))):
                draftQuery = `AND prod.draft_status NOT IN $1`;
                break;
            case (Array.isArray(draft_status) && draft_status.length > 0):
                draftQuery = `AND prod.draft_status IN (${draft_status.map((_, i) => `$${i + 1}`).join(", ")})`;
                break;
            default:
                draftQuery = "AND prod.draft_status = 'confirmed'";
        }

        let joinQuery = "JOIN ";
        switch (join) {
            case ('households'):
                break;
            case ('inventories'):
                joinQuery = `JOIN inventories i ON i.id = prod.inventory_id`;
                break;
            case ('users'):
            case ('profiles'):
                joinQuery = `JOIN profiles p ON p.id = prod.created_by`;
                break;
            case ('suppliers'):
            case ('vendors'):
                joinQuery = `JOIN vendors v ON v.id = prod.vendor_id`;
                break;
            case ('tasks'):
                joinQuery = `JOIN tasks t ON t.id = prod.task_id`;
                break;
            case ('task_assignments'):
                joinQuery = `JOIN task_assignments ta ON ta.task_id = prod.task_id`;
                break;
            default:
                return next(new BadRequestError("Invalid join type"));
        }
        `${!!join && join.includes('tasks') ? "JOIN tasks t ON t.id = prod.task_id" : ""}
${!!join && join.includes('tasks') ? "JOIN task_assignments ta ON ta.task_id = t.id" : ""}
${!!join && join.includes('tasks') ? "AND ta.user_id = $2" : ""}
${!!join && join.includes('tasks') ? "AND t.draft_status = 'confirmed'" : ""}`
        let templateQuery = "AND prod.is_template = false";
        switch (template) {
            case ('true'):
                templateQuery = "AND prod.is_template = true";
                break;
            case ('false'):
                break;
            case ('all'):
                templateQuery = "";
                break;
            default:
                return next(new BadRequestError("Invalid template type"));
        }

        let selectQuery = `SELECT 
        prod.product_name as product_name,
        prod.description as product_description,
        prod.created_at as product_created_at,
        prod.updated_dt as product_updated_date,
        prod.draft_status as product_draft_status,
        prod.product_category as product_category,
        prod.completion_status as product_completion_status,
        prod.auto_replenish as product_auto_replenish,
        prod.min_quantity as product_min_quantity,
        prod.max_quantity as product_max_quantity,
        prod.current_quantity as product_current_quantity,
        prod.barcode as product_barcode,
        prod.created_by as product_created_by,
        prod.scan_history as product_scan_history,
        prod.last_scanned as product_last_scanned,
        prod.expiration_date as product_expiration_date,
         FROM products as prod
         `;

        switch (select) {
            case ('all'):
            case ('*'):
                break;
            case (Array.isArray(select) && select.length > 0):
                selectQuery = select.reduce((acc, curr, i) => {
                    if (!curr.startsWith("!") || !curr.startsWith("-")) {
                        acc += `prod.${curr} as prod_${curr}${i < select.length - 1 ? "," : ""}`;
                    }
                }, `SELECT`) + ` FROM products as prod`;
                break;
            default:
                return next(new BadRequestError("Invalid select keys"));
        }

        const query = `
        ${selectQuery ?? `SELECT 
        prod.product_name as product_name,
        prod.description as product_description,
        prod.created_at as product_created_at,
        prod.updated_dt as product_updated_date,
        prod.draft_status as product_draft_status,
        prod.product_category as product_category,
        prod.completion_status as product_completion_status,
        prod.auto_replenish as product_auto_replenish,
        prod.min_quantity as product_min_quantity,
        prod.max_quantity as product_max_quantity,
        prod.current_quantity as product_current_quantity,
        prod.barcode as product_barcode,
        prod.created_by as product_created_by,
        prod.scan_history as product_scan_history,
        prod.last_scanned as product_last_scanned,
        prod.expiration_date as product_expiration_date,
         FROM products as prod`}
        WHERE 
        (LOWER(prod.product_name) LIKE LOWER($1) OR LOWER(prod.description) LIKE LOWER($1))
        ${draftQuery/* AND prod.draft_status = ??*/} 
        ${joinQuery}
        ${templateQuery}
        ORDER BY prod.${order ?? "product_name"}
        ${!!limit ? `LIMIT ${limit?.[0] ?? limit ?? 10}` : ""}
        `;
        const results = await db.query(query,
            [`%${searchTerm}%`,
            req?.context?.user?.id]);
        return res.json({ results });
    } catch (err) {
        return next(err);
    }
}
);

export default searchRoutes;