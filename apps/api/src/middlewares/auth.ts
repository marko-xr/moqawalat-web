import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      sub: string;
      role: "OWNER" | "ADMIN";
      email: string;
    };

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
