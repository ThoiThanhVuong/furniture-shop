// src/api/categories/category.controller.ts
import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response";

const categoryService = new CategoryService();

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAll();
  sendSuccess(res, categories);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params.id);
  sendSuccess(res, category);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;

  const data = {
    ...req.body,
    // nếu có file → /images/ten-file, nếu không thì undefined (service set null)
    image: file ? `/images/${file.originalname}` : undefined,
  };

  const category = await categoryService.create(data);
  sendCreated(res, category);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;

  const data: any = {
    ...req.body,
  };

  // chỉ set image nếu có file upload hoặc client cố ý gửi image rỗng
  if (file) {
    data.image = `/images/${file.originalname}`;
  }

  const category = await categoryService.update(req.params.id, data);
  sendSuccess(res, category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.delete(req.params.id);
  sendNoContent(res);
});
