import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array()
    });
  }

  return next();
}
