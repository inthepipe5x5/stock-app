
import { BadRequestError } from "../expressError.js";
import db from "../db.js";
/** @middleware @function checkSelectQueryParams 
 *  @description Middleware to check if the query params are valid for a select query
*  
*/
export const checkSelectQueryParams = async (req, res, next) => {
    const { select, from } = req.query || req.body || null;
    //proceed if no select or from params
    if (!select || !from) {
        next();
    }
    
    const schema = db.query(
        `SELECT table_name, column_name, data_type
         FROM information_schema.columns
         WHERE table_schema = 'public'
         ORDER BY table_name, ordinal_position;`
    )
    if (!!schema?.rows?.length) {
        throw ("No schema found"); //throw 500 error for server
    }
    const mapping = (schema?.rows ?? []).reduce((acc, row) => {
        const { table_name, column_name, data_type } = row;
        if (!acc[table_name]) {
            acc[table_name] = [];
        }
        acc[table_name].push({ column_name, data_type });
        return acc;
    }
        , {});
    // Check if 'from' is a valid table name or array of table names
    const tableNames = Object.keys(mapping);
    if (typeof from === "string") {
        if (!tableNames.includes(from)) {
            throw new BadRequestError(`Invalid table name: ${from}`);
        }
    } else if (Array.isArray(from)) {
        const invalidTables = from.filter((table) => !tableNames.includes(table));
        if (invalidTables.length > 0) {
            throw new BadRequestError(`Invalid table names: ${invalidTables.join(", ")}`);
        }
    } else {
        throw new BadRequestError("Invalid table name format");
    }

    // Check if 'select' contains valid column names for the given 'from' table(s)
    const selectedColumns = Array.isArray(select) ? select : [select];
    const invalidColumns = selectedColumns.filter((column) => {
        return Array.isArray(from)
            ? !from.some((table) => mapping[table]?.some((col) => col.column_name === column))
            : !mapping[from]?.some((col) => col.column_name === column);
    });

    if (invalidColumns.length > 0) {
        throw new BadRequestError(`Invalid column names: ${invalidColumns.join(", ")}`);
    }

    return next();
}