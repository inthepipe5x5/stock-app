/**
 * Converts a snake_case string to camelCase.
 * @param {string} snakeCaseStr - The string to convert.
 * @returns {string} The converted string in camelCase.
 */
export const convertSnakeToCamel = (snakeCaseStr) => {
  // Guard clause: Return the original string if it is not a non-empty string.
  if (!snakeCaseStr || typeof snakeCaseStr !== "string") return snakeCaseStr;

  // Replace underscores followed by lowercase letters with the uppercase version of the letter.
  return snakeCaseStr.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converts a camelCase string to snake_case.
 * @param {string} camelCaseStr - The string to convert.
 * @returns {string} The converted string in snake_case.
 */
export const convertCamelToSnake = (camelCaseStr) => {
  // Guard clause: Return the original string if it is not a non-empty string.
  if (!camelCaseStr || typeof camelCaseStr !== "string") return camelCaseStr;

  // Insert underscores before uppercase letters and convert to lowercase.
  return camelCaseStr.replace(
    /([A-Z])/g,
    (match, letter) => `_${letter.toLowerCase()}`
  );
};
