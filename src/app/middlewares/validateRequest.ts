/* import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.errors.map((error) => ({
            path: error.path.join("."),
            message: error.message,
          })),
        });
      }
      return next(err);
    }
  };

export default validateRequest; */

import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

const validateRequest =
  (schemas: ValidationSchemas) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{
      type: "body" | "query" | "params";
      issues: ZodError["issues"];
    }> = [];

    // Validate body
    if (schemas.body) {
      try {
        await schemas.body.parseAsync(req.body);
      } catch (err) {
        if (err instanceof ZodError) {
          errors.push({ type: "body", issues: err.issues });
        } else {
          return next(err); // Non-Zod error, pass to next
        }
      }
    }

    // Validate query
    if (schemas.query) {
      try {
        await schemas.query.parseAsync(req.query);
      } catch (err) {
        if (err instanceof ZodError) {
          errors.push({ type: "query", issues: err.issues });
        } else {
          return next(err);
        }
      }
    }

    // Validate params
    if (schemas.params) {
      try {
        await schemas.params.parseAsync(req.params);
      } catch (err) {
        if (err instanceof ZodError) {
          errors.push({ type: "params", issues: err.issues });
        } else {
          return next(err);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.map((errorGroup) => ({
          type: errorGroup.type,
          details: errorGroup.issues.map((error) => ({
            path: error.path.join("."),
            message: error.message,
          })),
        })),
      });
    }

    return next();
  };

export default validateRequest;
