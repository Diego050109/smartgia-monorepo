import { NextFunction, Request, Response } from "express";

export function internalMiddleware(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected) return res.status(500).json({ message: "INTERNAL_SERVICE_TOKEN not set" });

  const got = req.header("x-internal-token");
  if (got !== expected) return res.status(403).json({ message: "Forbidden" });

  next();
}
