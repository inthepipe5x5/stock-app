import parseTimeString from "./parseTimeString";
//return a NumericDate string of the time now (in UTC string format) + a duration in seconds
export default createExpiration = (
  duration = process.env.REFRESH_TOKEN_DURATION
) => {
  return new Date(Date.now() + parseTimeString(duration)).toUTCString();
};
