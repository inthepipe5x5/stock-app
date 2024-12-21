"use strict";

/** Routes for authentication. */
import express from "express";
import supabase from "../lib/supabase.js";
import parseTimeString from "../helpers/parseTimeString.js";
import { UnauthorizedError } from "../expressError.js";
import ProductInventories from "../models/productInventories.js";
import UserHouseholds from "../models/userhouseholds.js";
const authRoutes = express.Router();

//TODO: turn this into a route that re-authenticates a user from a magic link
// /** POST /refresh: Refresh access token using refresh token.
//  *
//  * Returns: { accessToken, user }
//  */
// authRoutes.post("/refresh", async (req, res, next) => {
//   const { refreshToken } = req.cookies;

//   if (!refreshToken) {
//     return res.status(401).json({ message: "Refresh token not provided" });
//   }

//   try {
//     const { data, error } = await supabase.auth.admin.refreshSession(
//       refreshToken
//     );

//     if (error) {
//       return next(new UnauthorizedError("Invalid refresh token"));
//     }

//     const { access_token, refresh_token, user } = data;

//     res.cookie("refresh_token", refresh_token, {
//       httpOnly: true, // Prevents access via JavaScript
//       secure: process.env.NODE_ENV === "production", // Use secure cookies in production
//       sameSite: "strict", // Prevents CSRF
//       maxAge: parseInt(process.env.REFRESH_TOKEN_DURATION, 10), // 14 days in milliseconds
//     });

//     res.json({ accessToken: access_token, user });
//   } catch (err) {
//     res.status(403).json({ message: "Invalid refresh token" });
//     console.error(err);
//   }
// });

/** POST /newuser: Set up a new user with a default household and inventory if none exists.
 *
 * Returns: { householdId, inventoryId }
 */
authRoutes.post("/newuser", async (req, res, next) => {
  const { userId } = res.locals.user;

  try {
    // Check if user already has a household or inventory

    const existingHousehold = await UserHouseholds.getHouseholdsForUser(userId);

    if (existingHousehold) {
      return res.status(200).json({ message: "User already set up" });
    }

    // Create default household
    const newDefaultHousehold = await UserHouseholds.addUserToHousehold({
      user_id: userId,
      name: "Default Household",
    });

    if (!newDefaultHousehold) {
      throw new Error("Failed to create household");
    }

    // Create default inventory
    const newDefaultInventory = ProductInventories.create({
      household_id: newDefaultHousehold.id,
      name: "Default Inventory",
      category: "Default",
      draft_status: "confirmed",
    });

    if (inventoryError) {
      throw new Error("Failed to create inventory");
    }

    res.status(201).json({
      household: newDefaultHousehold,
      inventory: newDefaultInventory,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

export default authRoutes;
