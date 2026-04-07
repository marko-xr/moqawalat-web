import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "ليس لديك صلاحية" });
    }

    return next();
  };
}
