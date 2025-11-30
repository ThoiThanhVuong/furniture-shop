import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

import { sendError } from "../utils/response";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return sendError(res, "Database error", 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", 401);
  }

  // Default error
  return sendError(
    res,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
    500
  );
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
