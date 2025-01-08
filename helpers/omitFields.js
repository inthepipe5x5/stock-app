import { z } from "zod";

// Function to dynamically omit fields, default is to omit "uuid" fields
/**
 * Omits specified fields from a Zod schema based on their types or names.
 *
 * @param {object} schema - The Zod schema object to filter.
 * @param {string[]} [omitTypes=["uuid"]] - An array of types to omit from the schema.
 * @param {string[]} [excludedFields=[]] - An array of field names to exclude from omission.
 * @returns {object} - A new Zod schema object with the specified fields omitted.
 */
const omitFields = (schema, omitTypes = ["uuid"], excludedFields = []) => {
    const shape = schema.shape; // Get the shape of the object schema
    const filteredShape = Object.fromEntries(
        Object.entries(shape).filter(([key, value]) => {
            // Exclude fields that are in the excludedFields array
            if (excludedFields.includes(key)) {
                return true;
            }
            // Check if the field type matches any of the omitTypes
            if (value instanceof z.ZodString) {
                return !value._def.checks.some((check) => omitTypes.includes(check.kind));
            }
            return true;
        })
    );
    return z.object(filteredShape); // Create a new schema with the filtered shape
};
export default omitFields;

/* Example usage

// Create a child schema without UUID fields
const ChildSchema = omitFields(BaseSchema);

// Example usage
try {
    const validData = ChildSchema.parse({
        name: "John Doe",
        email: "john.doe@example.com",
        otherField: 42,
    });
    console.log("Valid data:", validData); // Passes validation
} catch (err) {
    console.error("Validation failed:", err.errors);
}

// This will fail because `id` and `anotherId` are omitted in ChildSchema
try {
    ChildSchema.parse({
        id: "1a657d0c-b676-4bbf-9d18-d9ecb8547d8d",
        name: "John Doe",
        email: "john.doe@example.com",
        otherField: 42,
        anotherId: "2b657d0c-b676-4bbf-9d18-d9ecb8547d8d",
    });
} catch (err) {
    console.error("Validation failed:", err.errors);
}

*/
