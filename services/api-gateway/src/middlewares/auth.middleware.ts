import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = [/^\/health/, /^\/auth(\/|$)/];

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  
  if (req.method === "OPTIONS") return next();
if (PUBLIC_PATHS.some((re) => re.test(req.path))) return next();

  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = auth.replace("Bearer ", "");

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT_ACCESS_SECRET missing" });
  }

  try {
    const payload = jwt.verify(token, secret) as any;

    // Propagar identidad
    req.headers["x-user-id"] = payload.sub;
    req.headers["x-user-email"] = payload.email;

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

