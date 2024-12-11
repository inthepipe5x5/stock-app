/**
 * The function `parseTimeString` converts a time string into seconds based on specified units
 * (seconds, minutes, hours, days, weeks, years).
 * @param timeStr - The `timeStr` parameter in the `getExpirationTime` function represents a time
 * string that specifies a duration in seconds, minutes, hours, days, weeks, or years. The format of
 * the time string should be a number followed by a single character representing the unit of time
 * (e.g.,
 * @returns The `parseTimeString` function takes a time string as input (e.g., '1h', '7d', '30s') and
 * parses it to calculate the equivalent number of seconds. It then returns the total number of seconds
 * based on the provided time string.
  
  // Examples:
  * @example getExpirationTime('1h')  // 1 hour from now in Unix timestamp
  * @example getExpirationTime('7d')  // 7 days from now in Unix timestamp
  * @example getExpirationTime('30s') // 30 seconds from now in Unix timestamp
 */

export default parseTimeString = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string" || timeStr === null)
    throw new TypeError("Invalid time string format");
  else {
    timeStr = timeStr.toLowerCase(); //convert to lower case for standardized matching
    const regex =
      /^(\d+)(s|m|h|d|w|y|min|hour|day|days|week|weeks|year|years|month|months)$/;
    const match = timeStr.match(regex);

    if (!match) {
      throw new Error("Invalid time string format");
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    const multipliers = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
      w: 7 * 24 * 60 * 60,
      y: 365 * 24 * 60 * 60,
      min: 60,
      hour: 60 * 60,
      day: 24 * 60 * 60,
      days: 24 * 60 * 60,
      week: 7 * 24 * 60 * 60,
      weeks: 7 * 24 * 60 * 60,
      year: 365 * 24 * 60 * 60,
      years: 365 * 24 * 60 * 60,
      month: 30 * 24 * 60 * 60, // Approximate number of seconds in a month
      months: 30 * 24 * 60 * 60, // Approximate number of seconds in a month
    };

    return num * multipliers[unit];
  }
};
