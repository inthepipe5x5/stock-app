import jwt from "jsonwebtoken";
import crypto from "crypto";

import { UnauthorizedError } from "../expressError";
import User from "../models/user";
import parseTimeString from "./parseTimeString";
import { SECRET_KEY } from "../config";

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

export { createToken, updateAccessToken };
