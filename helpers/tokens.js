import jwt from "jsonwebtoken";
import crypto from "crypto";

import { UnauthorizedError } from "../expressError.js";
import User from "../models/user.js"; // Assuming User is a model that interacts with your database
import parseTimeString from "../helpers/parseTimeString.js"; // Assuming this is a utility function to parse time strings
import { SECRET_KEY } from "../config/config.js"
import supabase from "../lib/supabase.js";

const createToken = ({
  oauthProviderId,
  roleAccess,
  households,
  inventories,
  tokenType = "access",
}) => {
  if (
    !tokenType ||
    typeof tokenType !== "string" ||
    !["access", "refresh"].includes(tokenType.toLowerCase())
  )
    throw new TypeError("Invalid params for token creation received");

  const isAccessToken = tokenType.toLowerCase() === "access";

  // Construct payload based on token type
  const payload = isAccessToken
    ? { oauthProviderId, roleAccess, households, inventories }
    : { oauthProviderId }; // Minimal payload for refresh token

  // Set token options
  const options = {
    expiresIn: isAccessToken
      ? parseTimeString(process.env.ACCESS_TOKEN_DURATION) // e.g., "15m" => 15 min in seconds
      : parseTimeString(process.env.REFRESH_TOKEN_DURATION), // e.g., "14d" => 14 days in seconds
    jwtid: crypto.randomUUID(), // Unique ID for token
  };

  // Sign and return the token
  return jwt.sign(payload, SECRET_KEY, options);
};

const updateAccessToken = async (decodedRefreshToken) => {
  try {
    // const decoded = jwt.verify(refreshToken, SECRET_KEY); //this will be done in the /auth.js middleware

    // Fetch additional user data from the database
    const userData = await User.complexFind({
      oauthProviderId: decodedRefreshToken.oauthProviderId,
    });

    if (userData) {
      const newAccessToken = createToken({
        oauthProviderId: decodedRefreshToken.oauthProviderId,
        roleAccess: userData.roleAccess,
        households: userData.households,
        inventories: userData.inventories,
        tokenType: "access",
      });

      return newAccessToken;
    } else {
      throw new UnauthorizedError(
        `No user found with this oauthProviderId: ${decodedRefreshToken.oauthProviderId}`
      );
    }
  } catch (error) {
    console.error("Error updating access token:", error);
    throw new Error("Unable to update access token");
  }
};

const validateSupabaseToken = async (token) => {
  // Step 1: Get the user from Supabase Auth using the access token
  const { data: userData, error: userError } = await supabase.auth.getUser(
    token
  );

  // Step 2: Check for errors
  if (userError) {
    console.error("Error fetching user:", userError);
    return null; // Token is invalid or expired
  }

  // Step 3: Return the user ID and other user data
  return userData.user; // This contains the user ID and other information
};

export { createToken, updateAccessToken, validateSupabaseToken };
