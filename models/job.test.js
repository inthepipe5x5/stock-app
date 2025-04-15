// "use strict";

// import { NotFoundError, BadRequestError } from "../expressError";
// import { query } from "../db.js";
// import { create, findAll, get, update, remove } from "./job.js";
// import {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   testJobIds,
// } from "./_testCommon";

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
// afterAll(commonAfterAll);

// /************************************** create */

// describe("create", function () {
//   let newJob = {
//     companyHandle: "c1",
//     title: "Test",
//     salary: 100,
//     equity: "0.1",
//   };

//   test("works", async function () {
//     let job = await create(newJob);
//     expect(job).toEqual({
//       ...newJob,
//       id: expect.any(Number),
//     });
//   });
// });

// /************************************** findAll */

// describe("findAll", function () {
//   test("works: no filter", async function () {
//     let jobs = await findAll();
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[0],
//         title: "Job1",
//         salary: 100,
//         equity: "0.1",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[1],
//         title: "Job2",
//         salary: 200,
//         equity: "0.2",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[2],
//         title: "Job3",
//         salary: 300,
//         equity: "0",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[3],
//         title: "Job4",
//         salary: null,
//         equity: null,
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by min salary", async function () {
//     let jobs = await findAll({ minSalary: 250 });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[2],
//         title: "Job3",
//         salary: 300,
//         equity: "0",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by equity", async function () {
//     let jobs = await findAll({ hasEquity: true });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[0],
//         title: "Job1",
//         salary: 100,
//         equity: "0.1",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[1],
//         title: "Job2",
//         salary: 200,
//         equity: "0.2",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by min salary & equity", async function () {
//     let jobs = await findAll({ minSalary: 150, hasEquity: true });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[1],
//         title: "Job2",
//         salary: 200,
//         equity: "0.2",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by name", async function () {
//     let jobs = await findAll({ title: "ob1" });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[0],
//         title: "Job1",
//         salary: 100,
//         equity: "0.1",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });
// });

// /************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let job = await get(testJobIds[0]);
//     expect(job).toEqual({
//       id: testJobIds[0],
//       title: "Job1",
//       salary: 100,
//       equity: "0.1",
//       company: {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("not found if no such job", async function () {
//     try {
//       await get(0);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe("update", function () {
//   let updateData = {
//     title: "New",
//     salary: 500,
//     equity: "0.5",
//   };
//   test("works", async function () {
//     let job = await update(testJobIds[0], updateData);
//     expect(job).toEqual({
//       id: testJobIds[0],
//       companyHandle: "c1",
//       ...updateData,
//     });
//   });

//   test("not found if no such job", async function () {
//     try {
//       await update(0, {
//         title: "test",
//       });
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await update(testJobIds[0], {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await remove(testJobIds[0]);
//     const res = await query("SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such job", async function () {
//     try {
//       await remove(0);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
