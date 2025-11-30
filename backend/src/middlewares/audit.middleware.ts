import { Request, Response, NextFunction } from "express";
import prisma from "../utils/db";

export const auditLog = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.userId || null;
        const entityId = body?.data?.id || req.params?.id || null;

        prisma.auditLog
          .create({
            data: {
              userId,
              action,
              entity,
              entityId,
              oldValue: JSON.stringify(req.body?.oldValue || null),
              newValue: JSON.stringify(body?.data || null),
              ipAddress: req.ip,
              userAgent: req.get("user-agent"),
            },
          })
          .catch((err) => {
            console.log("Audit log failed:", err);
          });
      }

      return originalJson(body);
    };

    next();
  };
};
