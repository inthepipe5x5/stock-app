import { ForbiddenError } from "../expressError";

// Middleware to check RBAC permissions

const checkAccess = (action, resource) => {
  return (req, res, next) => {
    const permission = ac.can(req.user.role)[action](resource);
    if (permission.granted) {
      // Check if the resource status is allowed
      const resourceStatus = req.body.status || req.query.status; // Adjust based on how you pass status
      if (permission.filter(resource).status.includes(resourceStatus)) {
        next();
      } else {
        next(ForbiddenError("Access denied due to resource status"));
      }
    } else {
      next(ForbiddenError("Access denied"));
    }
  };
};

export default checkAccess;
