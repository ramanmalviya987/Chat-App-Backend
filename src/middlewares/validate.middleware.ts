import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";



export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("➡️ Enter Validate Middleware");

    
    try {
      req.body = schema.parse(req.body);
      console.log("✅ Validation Passed");

      next();
    } catch (error) {
      console.log("❌ Validation Failed");

      next(error);
    }
  };