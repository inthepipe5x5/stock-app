import { sign } from "jsonwebtoken";
import { SECRET_KEY } from "../config";

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return sign(payload, SECRET_KEY);
}

export default { createToken };
