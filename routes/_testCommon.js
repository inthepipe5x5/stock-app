// "use strict";

// const db = require("../db.js");
// const User = require("../models/user").default;
// const Company = require("../models/company");
// const Job = require("../models/job");
// const { createAccessToken } = require("../helpers/tokens");

// const testJobIds = [];

// async function commonBeforeAll() {
//   // noinspection SqlWithoutWhere
//   await db.query("DELETE FROM users");
//   // noinspection SqlWithoutWhere
//   await db.query("DELETE FROM companies");

//   await Company.create(
//       {
//         handle: "c1",
//         name: "C1",
//         numEmployees: 1,
//         description: "Desc1",
//         logoUrl: "http://c1.img",
//       });
//   await Company.create(
//       {
//         handle: "c2",
//         name: "C2",
//         numEmployees: 2,
//         description: "Desc2",
//         logoUrl: "http://c2.img",
//       });
//   await Company.create(
//       {
//         handle: "c3",
//         name: "C3",
//         numEmployees: 3,
//         description: "Desc3",
//         logoUrl: "http://c3.img",
//       });

//   testJobIds[0] = (await Job.create(
//       { title: "J1", salary: 1, equity: "0.1", companyHandle: "c1" })).id;
//   testJobIds[1] = (await Job.create(
//       { title: "J2", salary: 2, equity: "0.2", companyHandle: "c1" })).id;
//   testJobIds[2] = (await Job.create(
//       { title: "J3", salary: 3, /* equity null */ companyHandle: "c1" })).id;

//   await User.register({
//     username: "u1",
//     firstName: "U1F",
//     lastName: "U1L",
//     email: "user1@user.com",
//     password: "password1",
//     is_admin: false,
//   });
//   await User.register({
//     username: "u2",
//     firstName: "U2F",
//     lastName: "U2L",
//     email: "user2@user.com",
//     password: "password2",
//     is_admin: false,
//   });
//   await User.register({
//     username: "u3",
//     firstName: "U3F",
//     lastName: "U3L",
//     email: "user3@user.com",
//     password: "password3",
//     is_admin: false,
//   });

//   await User.applyToJob("u1", testJobIds[0]);
// }

// async function commonBeforeEach() {
//   await db.query("BEGIN");
// }

// async function commonAfterEach() {
//   await db.query("ROLLBACK");
// }

// async function commonAfterAll() {
//   await db.end();
// }


// const u1Token = createAccessToken({ username: "u1", is_admin: false });
// const u2Token = createAccessToken({ username: "u2", is_admin: false });
// const adminToken = createAccessToken({ username: "admin", is_admin: true });


// module.exports = {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   testJobIds,
//   u1Token,
//   u2Token,
//   adminToken,
// };
