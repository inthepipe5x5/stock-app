const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { SECRET_KEY } = require("../config");

/** Generate short-lived access token for short term auth */
function createAccessToken(user) {
  const payload = {
    user: user.id,
    role: user.role,
    email: user.email,
    households: user.households,
    inventory: user.inventory,
    tasks: user.tasks,
  };
  const options = {
    expiresIn: "1h", // Short-lived
    jwtid: crypto.randomUUID(), // Unique ID for token
  };
  return jwt.sign(payload, SECRET_KEY, options);
}

/** Generate refresh token */
function createRefreshToken() {
  return crypto.randomBytes(64).toString("hex"); // Secure random string
}


async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    // Find user with matching refresh token
    const user = await User.findByRefreshToken(refreshToken);
    if (!user) throw new UnauthorizedError("Invalid refresh token");

    // Check expiration
    if (new Date() > user.refresh_token_expires_at) {
      throw new UnauthorizedError("Refresh token expired");
    }

    // Rotate the refresh token
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenExpiresAt = new Date();
    newRefreshTokenExpiresAt.setDate(newRefreshTokenExpiresAt.getDate() + 30);

    await User.updateRefreshToken(user.id, newRefreshToken, newRefreshTokenExpiresAt);

    // Issue a new access token
    const accessToken = createAccessToken(user);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return next(err);
  }
}

export { createAccessToken, createRefreshToken };
