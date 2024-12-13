// __tests__/rbac.test.js

import { roles as rolesList, resources } from "./resources.json";
import { actions, options } from "./actions.json";
import ac from "./rbac";

describe("RBAC Configuration", () => {
  const roles = [...rolesList].map((role) => role.name);
  const { status: statuses } = options;

  test.each(roles)("%s role permissions", (role) => {
    resources.forEach((resource) => {
      actions.forEach((action) => {
        const permission = ac.can(role)[`${action}Any`](resource);

        if (role === "admin" || role === "manager") {
          expect(permission.granted).toBe(true);
          expect(permission.attributes).toEqual(["*"]);
          expect(permission.filter(resource).status).toEqual(statuses);
        } else if (role === "member") {
          if (action === "read") {
            expect(permission.granted).toBe(true);
            expect(permission.attributes).toEqual(["*"]);
            expect(permission.filter(resource).status).toEqual([
              "any",
              "confirmed",
            ]);
          } else {
            const ownPermission = ac.can(role)[`${action}Own`](resource);
            expect(ownPermission.granted).toBe(true);
            expect(ownPermission.attributes).toEqual(["*"]);
            expect(ownPermission.filter(resource).status).toEqual([
              "any",
              "confirmed",
            ]);
          }
        } else if (role === "guest") {
          if (action === "read") {
            expect(permission.granted).toBe(true);
            expect(permission.attributes).toEqual(["*"]);
            expect(permission.filter(resource).status).toEqual([
              "any",
              "confirmed",
            ]);
          } else {
            expect(permission.granted).toBe(false);
          }
        }
      });
    });
  });
});
