// __tests__/access.test.js

import checkAccess from "./access.js";

describe("checkAccess Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { role: "member" },
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("allows access for permitted action and status", () => {
    req.user.role = "admin";
    req.query.status = "draft";

    checkAccess("readAny", "Users")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("denies access for unpermitted action", () => {
    req.user.role = "guest";

    checkAccess("createAny", "Users")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      })
    );
  });

  test("denies access for unpermitted status", () => {
    req.user.role = "member";
    req.query.status = "deleted";

    checkAccess("readAny", "Users")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      })
    );
  });

  test("allows member to read confirmed status", () => {
    req.user.role = "member";
    req.query.status = "confirmed";

    checkAccess("readAny", "Users")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("allows member to create own resource", () => {
    req.user.role = "member";
    req.body.status = "confirmed";

    checkAccess("createOwn", "Tasks")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
