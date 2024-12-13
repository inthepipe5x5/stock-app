import AccessControl from "accesscontrol";
import { roles, resources, ownership } from "./resources.json";
import { actions, options } from "./actions.json";

const ac = new AccessControl();

// Helper function to determine allowed statuses based on role
const getAllowedStatuses = (roleId) => {
  if (roleId <= 2) {
    // Admin and Manager
    return options.status; // All statuses
  } else {
    return options.status.filter(
      (status) => status !== "deleted" && status !== "draft"
    );
  }
};

// Set up grants for each role
roles.forEach((role) => {
  const { name, roleId } = role;
  const allowedStatuses = getAllowedStatuses(roleId);

  // Set up permissions for resources
  resources.forEach((resource) => {
    actions.forEach((action) => {
      if (roleId <= 2) {
        // Admin and Manager roles
        ac.grant(name)
          [`${action}Any`](resource, ["*"])
          .when(({ status }) => allowedStatuses.includes(status));
      } else if (roleId === 3) {
        // Member role
        ac.grant(name)
          [`${action}Own`](resource, ["*"])
          .when(({ status }) => allowedStatuses.includes(status));
        ac.grant(name)
          [`readAny`](resource, ["*"])
          .when(({ status }) => allowedStatuses.includes(status));
      } else {
        // Guest role
        ac.grant(name)
          .readAny(resource, ["*"])
          .when(({ status }) => allowedStatuses.includes(status));
      }
    });
  });

  // Set up permissions for ownership resources
  ownership.forEach((resource) => {
    if (roleId <= 3) {
      // Admin, Manager, and Member roles
      actions.forEach((action) => {
        ac.grant(name)
          [`${action}Own`](resource, ["*"])
          .when(({ status }) => allowedStatuses.includes(status));
      });
    }
  });
});

export default ac;
