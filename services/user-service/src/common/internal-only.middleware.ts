import { Request, Response, NextFunction } from "express";

const PUBLIC = [/^\/health/, /^\/whoami/, /^\/$/];

export function internalOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (PUBLIC.some((re) => re.test(req.path))) return next();

  const expected = process.env.INTERNAL_SERVICE_TOKEN;
  const got = req.headers["x-internal-token"];

  if (!expected) return res.status(500).json({ message: "INTERNAL_SERVICE_TOKEN missing" });
  if (got !== expected) return res.status(403).json({ message: "Forbidden" });

  return next();
}
