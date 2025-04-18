// "use strict";

// /** Routes for Users. */

// import jsonschema from "jsonschema";

import { Router } from "express";
import { BadRequestError, NotFoundError } from "../expressError.js";
import db from "../db.js";
// import User from "../models/user";
// import { userCreateSchema, userUpdateSchema } from "../schemas/userSchema";
// import supabase from "../lib/supabase";

const userRoutes = Router({ mergeParams: true });

// /** POST / { user }  => { user, token }
//  *
//  * Adds a new user. This is not the registration endpoint --- instead, this is
//  * only for admin users to add new users. The new user being added can be an
//  * admin.
//  *
//  * This returns the newly created user and an authentication token for them:
//  *  {user: { id, firstName, lastName, email, roleAccess }, token }
//  *
//  * Authorization required: admin
//  **/

// userRoutes.post("/", ensureAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, userNewSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map((e) => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const user = await User.register(req.body);
//     const token = createAccessToken(user);
//     return res.status(201).json({ user, token });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** GET /[id] => { user }
//  *
//  * Returns { id, firstName, lastName, roleAccess, jobs }
//  *   where jobs is { id, title, companyHandle, companyName, state }
//  *
//  * Authorization required: admin or same user-as-:id
//  **/

// userRoutes.get("/:id", async function (req, res, next) {
//   try {
//     const user = await User.get(req.params.id);
//     return res.json({ user });
//   } catch (err) {
//     return next(err);
//   }
// });


// /** PATCH /[id] { user } => { user }
//  *
//  * Data can include:
//  *   { firstName, lastName, password, email }
//  *
//  * Returns { id, firstName, lastName, email, roleAccess }
//  *
//  * Authorization required: admin or same-user-as-:id
//  **/

// userRoutes.patch(
//   "/:id",
//   ensureCorrectUserOrAdmin,
//   async function (req, res, next) {
//     try {
//       const validator = jsonschema.validate(req.body, userUpdateSchema);
//       if (!validator.valid) {
//         const errs = validator.errors.map((e) => e.stack);
//         throw new BadRequestError(errs);
//       }

//       const user = await User.update(req.params.id, req.body);
//       return res.json({ user });
//     } catch (err) {
//       return next(err);
//     }
//   }
// );

// /** DELETE /[id]  =>  { deleted: id }
//  *
//  * Authorization required: admin or same-user-as-:id
//  **/

// userRoutes.delete(
//   "/:id",
//   ensureCorrectUserOrAdmin,
//   async function (req, res, next) {
//     try {
//       await User.remove(req.params.id);
//       return res.json({ deleted: req.params.id });
//     } catch (err) {
//       return next(err);
//     }
//   }
// );

userRoutes.get('/search', async (req, res, next) => {
    try {
        const {
            searchTerm, // search term to filter users
        } = req.query || req.body;
        const household_id = req?.context?.householdId || req?.context?.user?.["householdId"];
        if (!searchTerm) {
            throw new BadRequestError("Search term is required");
        }

        //string boolean to check if the request is within the user household if false else excludes existing members of user household
        const { externalOnly } = req?.query || req?.body

        const excludeInternalMembers = typeof externalOnly === "string" ? Boolean(externalOnly) : false;

        const query = `
        SELECT u.id, u.first_name, u.last_name, u.email
        FROM profiles u
        WHERE
            u.draft_status = 'confirmed'
            AND (
                u.first_name ILIKE $1 
                OR u.last_name ILIKE $1 
                OR u.email ILIKE $1 
                OR u.name ILIKE $1
            )
        ${excludeInternalMembers ? "AND u.id NOT IN (SELECT user_id FROM households WHERE household_id = $2)" : ""}
        SORT BY u.first_name, u.last_name
            LIMIT 10
            `
        const data = await db.query(query, [`%${searchTerm}%`, excludeInternalMembers ? household_id : null]);
        if (!!!data?.rows?.length) {
            return res.status(200).json({
                users: [],
            });
        }

        return res.json(users);
    } catch (err) {
        return next(err);
    }
});

export default userRoutes;
