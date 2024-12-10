"use strict";

import sqlForConditionFilters from "./sql.js"
console.log(sqlForConditionFilters); // Should log a function

describe("sqlForConditionFilters", function () {
  test("works: 1 item with default separator (AND)", function () {
    const result = sqlForConditionFilters(
      { f1: "v1" },
      { f1: "f1", fF2: "f2" }
    );
    expect(result).toEqual({
      whereClause: '"f1"=$1',
      values: ["v1"],
    });
  });

  test("works: 2 items with default separator (AND)", function () {
    const result = sqlForConditionFilters(
      { f1: "v1", jsF2: "v2" },
      { jsF2: "f2" }
    );
    expect(result).toEqual({
      whereClause: '"f1"=$1 AND "f2"=$2',
      values: ["v1", "v2"],
    });
  });

  test("works: 2 items with custom separator (comma)", function () {
    const result = sqlForConditionFilters(
      { f1: "v1", jsF2: "v2" },
      { jsF2: "f2" },
      ", "
    );
    expect(result).toEqual({
      whereClause: '"f1"=$1, "f2"=$2',
      values: ["v1", "v2"],
    });
  });

  test("throws error when no filters are provided", function () {
    expect(() => {
      sqlForConditionFilters({}, { f1: "f1" });
    }).toThrowError("No filters provided");
  });

  test("works: unknown field (uses key as is)", function () {
    const result = sqlForConditionFilters({ unknown: "v1" }, { f1: "f1" });
    expect(result).toEqual({
      whereClause: '"unknown"=$1',
      values: ["v1"],
    });
  });
});
