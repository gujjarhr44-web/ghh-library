import type { Request, Response, NextFunction } from "express";
import { verifyJwtToken, type AuthUserPayload } from "../lib/jwt";
import { logger } from "../lib/logger";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      requestId?: string;
      correlationId?: string;
    }
  }
}

export function extractAuthToken(req: Request): string | null {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  if (req.cookies && req.cookies["ghh_token"]) {
    return req.cookies["ghh_token"];
  }

  // Also check query param token for websocket or download streams if needed
  if (req.query && typeof req.query["token"] === "string") {
    return req.query["token"];
  }

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractAuthToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      errorCode: "AUTH_TOKEN_MISSING",
      message: "Authentication token required. Please log in.",
    });
  }

  const user = verifyJwtToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      errorCode: "AUTH_TOKEN_INVALID",
      message: "Invalid or expired session. Please log in again.",
    });
  }

  req.user = user;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractAuthToken(req);
  if (token) {
    const user = verifyJwtToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireRole(allowedRoles: Array<"student" | "owner" | "admin" | "super_admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errorCode: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        { userId: req.user.userId, userRole: req.user.role, allowedRoles, path: req.path },
        "Unauthorized role access attempt blocked"
      );
      return res.status(403).json({
        success: false,
        errorCode: "FORBIDDEN_ROLE",
        message: `Access denied. Requires ${allowedRoles.join(" or ")} privilege.`,
      });
    }

    next();
  };
}

export function requireTenantScope(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  // Super admins have cross-tenant access
  if (req.user.role === "admin" || req.user.role === "super_admin") {
    return next();
  }

  const targetLibraryId = (req.params["libraryId"] || req.query["libraryId"] || req.body?.libraryId) as string;

  if (targetLibraryId && req.user.libraryId && targetLibraryId !== req.user.libraryId) {
    logger.warn(
      { userId: req.user.userId, userLibraryId: req.user.libraryId, targetLibraryId },
      "Cross-tenant isolation violation blocked"
    );
    return res.status(403).json({
      success: false,
      errorCode: "TENANT_MISMATCH",
      message: "Access forbidden: You cannot access data outside your assigned library.",
    });
  }

  next();
}
