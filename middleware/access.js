import {
  ForbiddenError,
  UnauthorizedError,
  BadRequestError,
} from "../expressError.js";
import url from "url";
// import UserHouseholds from "../models/userhouseholds.js";
// import ProductInventories from "../models/productInventories.js";
// import TaskAssignments from "../models/taskAssignments.js";
import User from "../models/user.js";
// Middleware to check RBAC permissions
import db from "../db.js";
import {
  ForbiddenError,
  UnauthorizedError,
  BadRequestError,
} from "../expressError.js";
import url from "url";
// import User from "../models/user.js";
import supabase from "../lib/supabase.js";
import getTableNames from "../helpers/dbTables.js";

//initialize table mapping
const tableMapping = {}
getTableNames()
  .then((tables) => {
    tables.forEach((table) => {
      tableMapping[table] = table;
    });
  }).then(() => {
    console.log("Table mapping initialized:", tableMapping);
  })
  .catch((err) => {
    console.error("Error fetching table names:", err);
  });

/**
 * Middleware to attach user context to the request object
 * Uses decoded access token to fetch user details, households, and inventories.
 */
const attachTokenAccess = async (req, res, next) => {
  try {
    const { user: userId } =
      req.context?.auth ?? req.cookies ?? req.params ?? req.body ?? req.query;

    if (!!!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const userProfile = await User.get(userId);
    if (!userProfile) {
      throw new BadRequestError("User not found");
    }
    const { households, roles } = userProfile ?? null;
    if (households.length > 0) {
      const inventories = await ProductInventories.getInventorysForUser(userId);
    }
    req.context = {
      user: { ...req.context.user, ...userProfile },
      roles,
      households,
    };
    next();
  } catch (err) {
    return next(err);
  }
};

const checkIfOwner = (req, res, next) => {
  try {
    if (!req.context || !req.context.user || !req.context.auth.id) {
      throw new UnauthorizedError("Unauthorized");
    }

    if (req.context.auth.is_super_admin) {
      return next();
    }

    const { id: userId } =
      req.context.user || req.context.auth.id || req.context.user_id;
    const { id: resourceId } = req.params;
    const { pathname } = url.parse(req.url);
    const resource = pathname.split("/")[1];
    const action = req.method;
    const userHouseholds = [...req.context.user.households];

    if (
      userId === resourceId &&
      ["profile", "user"].includes(resource.toLowerCase())
    ) {
      return next();
    }
    if (resource.toLowerCase() === "household") {
    }

    throw new ForbiddenError("Access denied");
  } catch (err) {
    return next(err);
  }
};

const checkDraftStatusAccess = async (req, res, next) => {
  if (req.context.auth.is_super_admin) {
    return next();
  }
  const { pathname } = url.parse(req.url);
  const resource = pathname.split("/")[1];
  if (!!!resource || (!!tableMapping && !resource in tableMapping)) {
    throw new BadRequestError("Resource not found");
  }
  const requestedHouseholds = req?.context?.households ?? req?.body?.households;
  const [resourceIdKey, resourceId] = Object.entries(req?.params ?? {}).find(([key, value]) => {
    return key.startsWith(resource) || key === 'id'
  })
  // const activeHousehold = req.context.user.households.find((h) => h.id === req.params.id) ?? req.context.households.find((h) => h.id === req.params.id);

  const requestedDraftStatus = await db.query(
    `SELECT draft_status FROM ${resource} WHERE $1 = $2`,
    [resourceIdKey, resourceId]
  )
  if (!!requestedDraftStatus) {

    const { data, error } = await supabase.rpc('check_user_access', {
      user_id: req.context.auth.id,
      household_id: req.context.household_id,
      draft_status: requestedDraftStatus ?? 'draft'
    })
  }
};

/**
 * Helper: Determine if a user has access to the requested resource.
 * @param {Object} req - Express request object
 * @param {string} roleAccess - User's role
 * @param {string} resourceId - ID of the requested resource
 * @param {Array} userHouseholds - User's household IDs
 * @param {string|null} draftStatus - Resource draft status
 * @returns {boolean} - Whether the user has access
 */
const hasAccess = (roleAccess, resourceId, userHouseholds, draftStatus) => {
  if (!roleAccess) return false;

  const normalizedRole = roleAccess.toLowerCase();
  if (normalizedRole === "admin") {
    return true; // Admins have full access
  }

  if (normalizedRole === "manager") {
    return userHouseholds.includes(resourceId); // Managers have access to their household
  }

  if (normalizedRole === "user") {
    return (
      userHouseholds.includes(resourceId) &&
      (!draftStatus || draftStatus === "confirmed") // Users can access confirmed resources
    );
  }

  return false; // Default to no access
};

/**
 * Middleware to check token access and enforce RBAC permissions
 */
const checkTokenAccess = (req, res, next) => {
  try {
    if (!req.context || !req.context.user || !req.context.user.households) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { role_access: roleAccess } = req.context.user;
    const resourceId = req.params.id;
    const draftStatus = req.body.draft_status || req.query.draft_status || null;

    const userHouseholds = req.context.user.households.map((h) => h.id);

    if (
      req.context.auth.is_super_admin ||
      hasAccess(roleAccess, resourceId, userHouseholds, draftStatus)
    ) {
      return next(); // Access granted
    }

    throw new ForbiddenError("Access denied");
  } catch (err) {
    return next(err);
  }
};

export default checkTokenAccess;
export { attachTokenAccess };
