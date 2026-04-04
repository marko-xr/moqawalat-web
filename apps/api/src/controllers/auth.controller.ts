import type { Request, Response } from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../services/prisma.js";

export const loginValidation = [
  body("email").isEmail().withMessage("Email is invalid"),
  body("password").isLength({ min: 6 }).withMessage("Password is required")
];

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  const token = jwt.sign(
    { role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { subject: user.id, expiresIn }
  );

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true }
  });

  return res.json(user);
}
