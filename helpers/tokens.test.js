const jwt = require("jsonwebtoken");
const { createAccessToken } = require("./tokens");
const { SECRET_KEY } = require("../config");

describe("createAccessToken", function () {
  test("works: not admin", function () {
    const token = createAccessToken({ username: "test", is_admin: false });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      is_admin: false,
    });
  });

  test("works: admin", function () {
    const token = createAccessToken({ username: "test", is_admin: true });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      is_admin: true,
    });
  });

  test("works: default no admin", function () {
    // given the security risk if this didn't work, checking this specifically
    const token = createAccessToken({ username: "test" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      is_admin: false,
    });
  });
});
