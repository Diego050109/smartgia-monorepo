import type { Request, Response, NextFunction } from "express";

const PUBLIC_PATHS = [
  "/health",
];

export function internalMiddleware(req: Request, res: Response, next: NextFunction) {
  // deja pasar health sin nada
  if (PUBLIC_PATHS.includes(req.path)) return next();

  const token = process.env.INTERNAL_SERVICE_TOKEN;
  const incoming = req.headers["x-internal-token"];

  if (!token) return res.status(500).json({ message: "INTERNAL_SERVICE_TOKEN missing" });

  if (incoming !== token) return res.status(403).json({ message: "Forbidden" });

  return next();
}
