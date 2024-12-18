/* Middleware to help wit validating RBAC
Inspired by: https://github.com/japananh/node-express-postgres-boilerplate/blob/master/src/middlewares/validateAccessControl.js

*/
import { roles } from "./rbac";
import { UnauthorizedError } from "../expressError.js";

const rolesAccess = (action, resource) => {
  return async (req, _res, next) => {
    try {
      // eslint-disable-next-line eqeqeq
      const isOwnedUser = req.user.userId === req.params.userId;
      const modifiedAction = isOwnedUser
        ? action.replace("Any", "Own")
        : action;

      const permission = roles
        .can(JSON.stringify(req.user.roleId))
        [modifiedAction](resource);

      if (!permission.granted) {
        throw new UnauthorizedError(
          "You don't have enough permission to perform this action"
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default { rolesAccess };
