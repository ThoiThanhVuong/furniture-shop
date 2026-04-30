import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = "Success",
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string = "Error",
  statusCode: number = 400,
  errors?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: message,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data?: T,
  message: string = "Resource created successfully"
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

export const sendUnauthorized = (
  res: Response,
  message: string = "Unauthorized"
): Response => {
  return sendError(res, message, 401);
};

export const sendForbidden = (
  res: Response,
  message: string = "Forbidden"
): Response => {
  return sendError(res, message, 403);
};

export const sendNotFound = (
  res: Response,
  message: string = "Resource not found"
): Response => {
  return sendError(res, message, 404);
};

export const sendValidationError = (
  res: Response,
  errors: any,
  message: string = "Validation failed"
): Response => {
  return sendError(res, message, 422, errors);
};

export const sendServerError = (
  res: Response,
  message: string = "Internal server error"
): Response => {
  return sendError(res, message, 500);
};
