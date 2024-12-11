import parseTimeString from "./parseTimeString";

describe("parseTimeString", () => {
  it("should parse time string in SECONDS", () => {
    expect(parseTimeString("30s")).toBe(30);
  });
  it("should parse time string and handle CASE DIFFERENCES", () => {
    expect(parseTimeString("30S")).toBe(30);
    expect(parseTimeString("7DAys")).toBe(604800);
    expect(parseTimeString("15mIn")).toBe(900);
  });

  it("should parse time string in MINUTES", () => {
    expect(parseTimeString("1m")).toBe(60);
    expect(parseTimeString("15min")).toBe(900);
  });

  it("should parse time string in HOURS", () => {
    expect(parseTimeString("1h")).toBe(3600);
    expect(parseTimeString("1hour")).toBe(3600);
  });

  it("should parse time string in DAYS", () => {
    expect(parseTimeString("7d")).toBe(604800);
    expect(parseTimeString("7day")).toBe(604800);
    expect(parseTimeString("7days")).toBe(604800);
  });

  it("should parse time string in WEEKS", () => {
    expect(parseTimeString("1w")).toBe(604800);
    expect(parseTimeString("1week")).toBe(604800);
    expect(parseTimeString("1weeks")).toBe(604800);
  });

  it("should parse time string in MONTHS", () => {
    expect(parseTimeString("1month")).toBe(2592000);
    expect(parseTimeString("1months")).toBe(2592000);
    expect(parseTimeString("2month")).toBe(5184000);
    expect(parseTimeString("2months")).toBe(5184000);
  });

  it("should parse time string in YEARS", () => {
    expect(parseTimeString("1y")).toBe(31536000);
    expect(parseTimeString("1year")).toBe(31536000);
    expect(parseTimeString("1years")).toBe(31536000);
  });

  it("should throw an error for invalid time string format", () => {
    expect(() => parseTimeString("invalid")).toThrowError(
      "Invalid time string format"
    );
    expect(() => parseTimeString("999invalid")).toThrowError(
      "Invalid time string format"
    );
    expect(() => parseTimeString("999")).toThrowError(
      "Invalid time string format"
    );
  });
});
