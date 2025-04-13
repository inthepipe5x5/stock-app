import { Router } from "express";
import User from "../models/user";
import { BadRequestError, UnauthorizedError } from "../expressError";
import UserInventories from "../models/userinventories";

const sessionRoutes = Router({ mergeParams: true });

/** GET / => { profile, households, inventories, ...supabaseSession }
 *
 * Returns
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:id
 **/

sessionRoutes.get("/", async function (req, res, next) {
  try {
    let userSessionData = {
      profile: req.context.profile ?? null,
      households: req.context.households ?? null,
      inventories: req.context.inventories ?? null,
    };
    if (req.context) {
      const { user, auth, profile } = req.context;
      userSessionData["profile"] = { ...user, ...profile, ...auth };
    } else {
      const user = await User.get(id);
      const { households } = user;
      userSessionData["profile"] = user;
      userSessionData["households"] = {
        ...userSessionData["households"],
        ...households,
      };
    }
    return res.json(userSessionData, 200);
    // return res.json({ session });
  } catch (err) {
    return next(err);
  }
});
