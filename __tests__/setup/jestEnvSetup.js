/* env set up logic for Jest tests */
import { defaultTestEnvVars } from "./testConstants.js";

/**
 * The function `setupEnvVars` merges default and provided environment variables and sets them,
 * optionally returning the merged variables.
 * @param [envVars] - The `envVars` parameter is an object that contains environment variables provided
 * by the user. These variables will be merged with the default environment variables before setting
 * them.
 * @param [returnEnv=false] - The `returnEnv` parameter in the `setupEnvVars` function is a boolean
 * flag that determines whether the function should return the merged environment variables after
 * setting them. If `returnEnv` is set to `true`, the function will return the merged environment
 * variables object. If `returnEnv` is
 * @returns If the `returnEnv` parameter is set to `true`, the function will return the merged
 * environment variables stored in the `mergedEnvVars` object.
 */
const setupEnvVars = (envVars = {}, returnEnv = false) => {
  // Merge default environment variables with the provided ones
  const mergedEnvVars = { ...defaultTestEnvVars, ...envVars };

  // Set the environment variables
  Object.keys(mergedEnvVars).forEach((key) => {
    process.env[key] = mergedEnvVars[key];
  });

  // Return the set environment variables if requested
  if (returnEnv) {
    return mergedEnvVars;
  }
};
/**
 * Clears specified environment variables and optionally returns them.
 *
 * @param {Object|string[]|string} [enVarsToClear=defaultTestEnvVars] - An object, array of strings, or a single string containing the environment variables to clear.
 * @param {boolean} [returnEnv=false] - A boolean flag indicating whether to return the cleared environment variables.
 * @returns {Object|undefined} The object of cleared environment variables if returnEnv is true, otherwise undefined.
  
@example
// Example usage:
const defaultTestEnvVars = {
  TEST_VAR1: "value1",
  TEST_VAR2: null,
};

// Using an object
clearEnvVars(defaultTestEnvVars, true);

// Using an array of strings
clearEnvVars(["TEST_VAR3", "TEST_VAR4"], true);

// Using a single string
clearEnvVars("TEST_VAR5", true);

*/
const clearEnvVars = (
  enVarsToClear = defaultTestEnvVars,
  returnEnv = false
) => {
  // Ensure enVarsToClear is an object
  let envVarsObject;
  if (Array.isArray(enVarsToClear)) {
    // Convert array to object with null values
    envVarsObject = enVarsToClear.reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {}
    );
  } else if (typeof enVarsToClear === "string") {
    // Convert single string to object with null value
    envVarsObject = { [enVarsToClear]: null };
  } else if (
    typeof enVarsToClear === "object" &&
    !Array.isArray(enVarsToClear)
  ) {
    envVarsObject = enVarsToClear;
  } else {
    throw new Error(
      "enVarsToClear must be an object, array of strings, or a single string"
    );
  }

  const clearedEnvVars = {};

  // Iterate over the environment variables to clear
  for (const key in envVarsObject) {
    if (Object.hasOwn(envVarsObject, key)) {
      const defaultEnvValue = envVarsObject[key];
      // Store the current value before clearing
      clearedEnvVars[key] = process.env[key];

      // Reset the environment variable to the provided value or delete it if null
      if (defaultEnvValue !== null) {
        process.env[key] = defaultEnvValue;
      } else {
        delete process.env[key];
      }
    }
  }

  // Return the cleared environment variables if requested
  if (returnEnv) return clearedEnvVars;
};

export { setupEnvVars, clearEnvVars };
