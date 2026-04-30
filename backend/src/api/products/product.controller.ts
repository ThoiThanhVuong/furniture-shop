import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/response";
import { BadRequestError } from "../../utils/errors";

const productService = new ProductService();

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === "true";
  const filters = {
    categoryId: req.query.categoryId as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    search: req.query.search as string,
    isFeatured: req.query.isFeatured === "true" ? true : undefined,
    onSale: req.query.onSale === "true" ? true : undefined,
    isActive: includeInactive ? undefined : true,
  };

  const pagination = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sortBy: (req.query.sortBy as string) || "createdAt",
    sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
  };

  const result = await productService.getAll(filters, pagination);
  sendSuccess(res, result, "Products retrieved successfully");
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id);
  sendSuccess(res, product, "Product retrieved successfully");
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getBySlug(req.params.slug);
  sendSuccess(res, product, "Product retrieved successfully");
});
export const getSaleProducts = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const products = await productService.getSaleProducts(limit);

    res.json({
      success: true,
      message: "Sale products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;

  if (!body.categoryId) {
    throw new BadRequestError("categoryId is required");
  }
  if (!body.price) {
    throw new BadRequestError("price is required");
  }
  if (!body.stock) {
    throw new BadRequestError("stock is required");
  }

  const imageFile = (req as any).file
    ? `/images/${(req as any).file.filename}`
    : undefined;
  const product = await productService.create({
    name: body.name,
    slug: body.slug,
    description: body.description,
    price: Number(body.price),
    salePrice: body.salePrice ? Number(body.salePrice) : undefined,
    sku: body.sku,
    stock: Number(body.stock),
    categoryId: body.categoryId,
    isFeatured: body.isFeatured === "true",
    image: imageFile,
  });

  sendCreated(res, product, "Product created successfully");
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as any;
  const file = (req as any).file as Express.Multer.File | undefined;

  // Chuẩn bị object data để gửi xuống service
  const data: any = {};

  // Các field string
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description;
  if (body.sku !== undefined) data.sku = body.sku;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;

  // Number: price
  if (body.price !== undefined && body.price !== "") {
    data.price = Number(body.price);
  }

  // Number: salePrice (cho phép clear sale khi user để rỗng "")
  if (body.salePrice !== undefined) {
    if (body.salePrice === "") {
      data.salePrice = null; // clear sale
    } else {
      data.salePrice = Number(body.salePrice);
    }
  }

  // Number: stock
  if (body.stock !== undefined && body.stock !== "") {
    data.stock = Number(body.stock);
  }

  // Boolean: isFeatured, isActive
  if (body.isFeatured !== undefined) {
    data.isFeatured = body.isFeatured === "true" || body.isFeatured === true;
  }

  if (body.isActive !== undefined) {
    data.isActive = body.isActive === "true" || body.isActive === true;
  }

  if (file) {
    data.image = `/images/${file.filename}`;
  }

  const product = await productService.update(id, data);
  sendSuccess(res, product, "Product updated successfully");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.delete(req.params.id);

  sendSuccess(res, result, result.message);
});

export const getFeatured = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const products = await productService.getFeatured(limit);
  sendSuccess(res, products, "Featured products retrieved successfully");
});

export const getRelated = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 4;
  const products = await productService.getRelated(req.params.id, limit);
  sendSuccess(res, products, "Related products retrieved successfully");
});
export const applySaleToCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId, discountType, discountValue } = req.body;

    if (!categoryId || !discountType || discountValue == null) {
      throw new BadRequestError("Missing required fields");
    }

    const result = await productService.applySaleToCategory(
      categoryId,
      discountType,
      Number(discountValue)
    );

    sendSuccess(res, result, "Sale applied to category successfully");
  }
);

export const clearSaleByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.body;
    if (!categoryId) {
      throw new BadRequestError("Missing categoryId");
    }
    const result = await productService.clearSaleByCategory(categoryId);
    sendSuccess(res, result, "Sale cleared for category successfully");
  }
);
