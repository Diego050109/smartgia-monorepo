import { All, Controller, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const AUTH_TARGET = process.env.AUTH_SERVICE_URL || "http://localhost:4001";

const authProxy = createProxyMiddleware({
  target: AUTH_TARGET,
  changeOrigin: true,
});

@Controller()
export class ProxyController {
  // Captura cualquier cosa que empiece con /auth/...
  @All("auth/(.*)")
  proxyAuth(@Req() req: Request, @Res() res: Response) {
    authProxy(req, res, () => undefined);
  }
}
