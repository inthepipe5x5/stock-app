import { convertObjKeys, convertCamelToSnake, convertSnakeToCamel } from "../helpers/caseConverter";
import { Request, Response, NextFunction } from "express";
/**
 * Middleware to normalize the case of INCOMING request objects.
 * Changes all keys in the req.body to camelCase.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {Error} If the request body is not an object.
 */

export const requestCaseNormalizer = (req: Request, res: Response, next: NextFunction) => {
    console.log("Request Body Before Normalization:", JSON.stringify({ params: req.params, query: req.query, body: req.body }, null, 2));
    const { params, query, body } = req;
    [params, query, body].forEach((reqObj, idx) => {
        convertObjKeys(reqObj, "camel")
        switch (true) {
            case idx === 0:
                req.params = reqObj;
                break;
            case idx === 1:
                req.query = reqObj;
                break;
            case idx === 2:
                req.body = reqObj;
                break;
            default:
                throw new Error("Invalid request object");
        }
    })
    next();
}


/**
 * Middleware to normalize the case of OUTGOING response objects.
 * Converts all keys in the res.locals and res.body to snake_case.
 */
export const responseCaseNormalizer = (req: Request, res: Response, next: NextFunction) => {
    console.log("Response Body Before Normalization:", JSON.stringify({ res }, null, 2));

    if (!!res?.locals) {
        res.locals = convertObjKeys(res.locals, "snake");
    }

    console.log("Response Body After Normalization:", JSON.stringify({ res }, null, 2));

    next();
}