"use strict";

import supabase from "../lib/supabase";
import getTableNames from "../helpers/dbTables";
import { NextFunction, Request, Response } from "express";
import db from "../db";
import { Database } from "../models/dbTypes";

//function to get the household and user_household rows from the database
export const getHousehold = async (req: Request & {
    context: { [key: string]: any },
    body: { [key: string]: any }
}, res: Response, next: NextFunction) => {
    try {


        const { user } = req?.body ?? req?.context;
        //query params
        const { params } = req ?? {};
        const { selectedTables, filters } = extractSelectedTablesAndFilters(params);

        const householdData = await db.query(
            `SELECT uh.*, h.*, i.* FROM user_households as uh
         JOIN households as h
         ON h.id = uh.household_id
         JOIN inventories as i 
         ON i.household_id = h.id
         WHERE uh.user_id = $1`,
            [user?.user_id]
        );

        if (!!householdData?.rows && householdData?.rows?.length > 0) {
            const contextData = householdData?.rows.reduce((acc: any, row: any) => {
                const householdId = row.household_id;

                if (!acc[householdId]) {
                    acc[householdId] = {
                        ...row,
                        inventories: []
                    };
                }

                acc[householdId].inventories.push({
                    id: row.inventory_id,
                    ...row // Include inventory-specific fields
                });

                return acc;
            }, {});

            // Set the context with the household data
            req.context.set("households", contextData);
        }

        
    }
    catch (error) {
        console.error("Error fetching household data:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


//utility function to extract selected tables and filters from request query params
const extractSelectedTablesAndFilters = (queryParams: { [key: string]: any }) => {
    if (!('select' in queryParams)) {
        throw new Error("No tables selected");
    }
    const selectedTables = queryParams.select.split(",");
    const filters = {}
    for (const table of selectedTables) {
        if (table in queryParams) filters[table] = queryParams[table].split(",");
    }
    console.log("Selected tables and filters:", { selectedTables, filters });
    return { selectedTables, filters };
}