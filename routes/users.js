// "use strict";

// /** Routes for users. */

// const jsonschema = require("jsonschema");

const express = require("express");
// const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
// const { BadRequestError } = require("../expressError").default;
// const User = require("../models/user").default;
// const { createAccessToken } = require("../helpers/tokens").default;
const userNewSchema = require("../schemas/userNew.json");
const { default: supabase } = require("../lib/supabase");
// const userUpdateSchema = require("../schemas/userUpdate.json");

const userRoutes = express.Router({ mergeParams: true });



/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, roleAccess }, token }
 *
 *
 **/

router.post("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const name = req.body?.name ?? [(req.body.firstName ?? "").trim(), (req.body.lastName ?? "").trim()].join(" ");
        const draft_status = req.body?.draftStatus ?? "draft";
        //create auth.users
        const { data: { user }, error } = await supabase.auth.admin.createUser({
            email: req.body.email,
            password: req.body.password,
            user_metadata: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                roleAccess: req.body.roleAccess,
                draftStatus: req.body.draftStatus
            }
        });

        if (error) {
            throw new BadRequestError(error.message);
        }
        //create user in profiles table
        const { data: { profile }, error: profileError } = await supabase
            .from("profiles")
            .insert({
                name,
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                email: req.body.email,
                // roleAccess: req.body.roleAccess,
                draft_status
            });

        return res.status(201).json({ user, token });
    } catch (err) {
        return next(err);
    }
});


// /** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
//  *
//  * Returns list of all users.
//  *
//  * Authorization required: admin
//  **/

// router.get("/", ensureAdmin, async function (req, res, next) {
//   try {
//     const users = await User.findAll();
//     return res.json({ users });
//   } catch (err) {
//     return next(err);
//   }
// });


// /** GET /[username] => { user }
//  *
//  * Returns { username, firstName, lastName, roleAccess, jobs }
//  *   where jobs is { id, title, companyHandle, companyName, state }
//  *
//  * Authorization required: admin or same user-as-:username
//  **/

// router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     const user = await User.get(req.params.username);
//     return res.json({ user });
//   } catch (err) {
//     return next(err);
//   }
// });


// /** PATCH /[username] { user } => { user }
//  *
//  * Data can include:
//  *   { firstName, lastName, password, email }
//  *
//  * Returns { username, firstName, lastName, email, roleAccess }
//  *
//  * Authorization required: admin or same-user-as-:username
//  **/

// router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, userUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const user = await User.update(req.params.username, req.body);
//     return res.json({ user });
//   } catch (err) {
//     return next(err);
//   }
// });


// /** DELETE /[username]  =>  { deleted: username }
//  *
//  * Authorization required: admin or same-user-as-:username
//  **/

// router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     await User.remove(req.params.username);
//     return res.json({ deleted: req.params.username });
//   } catch (err) {
//     return next(err);
//   }
// });


// /** POST /[username]/jobs/[id]  { state } => { application }
//  *
//  * Returns {"applied": jobId}
//  *
//  * Authorization required: admin or same-user-as-:username
//  * */

// router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     const jobId = +req.params.id;
//     await User.applyToJob(req.params.username, jobId);
//     return res.json({ applied: jobId });
//   } catch (err) {
//     return next(err);
//   }
// });


// module.exports = router;
