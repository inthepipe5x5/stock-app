"use strict";

/** Express app for stockapp. */

import express, { json, Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { NotFoundError } from "./expressError.js";

import { attachAuthData, authenticateToken } from "./middleware/auth.js";
import { responseCaseNormalizer, requestCaseNormalizer } from "./middleware/caseNormalizer.ts";
import authRoutes from "./routes/auth.route.js";
import sessionRoutes from "./routes/session.route.js";
// import usersRoutes from "./routes/users";

import morgan from "morgan";
import { loggerMiddleware } from "./middleware/logger.js";
import searchRoutes from "./routes/search.route.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(json());
app.use(morgan(process.env.NODE_ENV === 'product' ? "tiny" : "combined"));
app.use(cookieParser()); //use cookie parser to handle http only cookies
//supabase auth middleware
app.use(authenticateToken);
app.use(attachAuthData); //attach user data to request context
app.use(requestCaseNormalizer); //normalize request to camel case

app.use("/auth", authRoutes);
app.use('/session', sessionRoutes)
app.use('/search', searchRoutes)
app.use(loggerMiddleware); //logging for debugging

app.use(responseCaseNormalizer); //normalize response to snake case
// app.use("/companies", companiesRoutes);
// app.use("/users", usersRoutes);
// app.use("/jobs", jobsRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req: Request, res: Response, next: NextFunction) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "production") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

export default app;
