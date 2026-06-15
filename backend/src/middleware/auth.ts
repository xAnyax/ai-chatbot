import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userStore } from "../userStore";

const JWT_SECRET = process.env.JWT_SECRET || "ai-chatbot-dev-secret";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface AuthTokenPayload {
  userId: string;
}

export function createAuthToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const user = userStore.getUserById(payload.userId);

    if (!user) {
      res.status(401).json({ error: "Invalid authentication token" });
      return;
    }

    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired authentication token" });
  }
}
