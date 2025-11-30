import { Product, Prisma } from "@prisma/client";
import prisma from "../../utils/db";
import { NotFoundError, ConflictError } from "../../utils/errors";

interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  onSale?: boolean;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class ProductService {
  async getAll(
    filters: ProductFilters = {},
    pagination: PaginationOptions = {}
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters.onSale) {
      where.salePrice = {
        not: null, // có giá sale
      };
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { sku: { contains: filters.search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Tăng view
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // TÍNH ĐÃ BÁN TỪ ORDER_ITEM (chỉ tính đơn COMPLETED + PAID)
    const soldAgg = await prisma.orderItem.aggregate({
      where: {
        productId: product.id,
        order: {
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const soldCount = soldAgg._sum.quantity || 0;

    // Trả về kèm soldCount
    return {
      ...product,
      soldCount,
    };
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Tăng view
    await prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    });

    //TÍNH ĐÃ BÁN TỪ ORDER_ITEM (chỉ tính đơn COMPLETED + PAID)
    const soldAgg = await prisma.orderItem.aggregate({
      where: {
        productId: product.id,
        order: {
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const soldCount = soldAgg._sum.quantity || 0;

    return {
      ...product,
      soldCount,
    };
  }
  async getSaleProducts(limit: number = 8) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        NOT: { salePrice: null },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    salePrice?: number;
    sku: string;
    stock: number;
    categoryId: string;
    isFeatured?: boolean;
    isActive?: boolean;
    image?: string;
  }) {
    // Check if slug or SKU exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug: data.slug }, { sku: data.sku }],
      },
    });

    if (existing) {
      throw new ConflictError(
        existing.slug === data.slug
          ? "Product slug already exists"
          : "Product SKU already exists"
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        sku: data.sku,
        stock: data.stock,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured || false,
        isActive: data.isActive ?? true,
        image: data.image,
      },
      include: {
        category: true,
      },
    });

    return product;
  }

  async update(id: string, data: Partial<Product>) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check slug uniqueness if updating
    if (data.slug && data.slug !== product.slug) {
      const existing = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictError("Product slug already exists");
      }
    }

    // Check SKU uniqueness if updating
    if (data.sku && data.sku !== product.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existing) {
        throw new ConflictError("Product SKU already exists");
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return updated;
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Nếu product đã trong đơn hàng → chỉ cho ngừng bán
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      // Không xoá, chỉ tắt isActive
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        message:
          "Sản phẩm đã được chuyển sang 'Ngừng bán' vì đã từng có trong đơn hàng.",
      };
    }

    // Nếu chưa xuất hiện trong order → vẫn soft delete để an toàn
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: "Sản phẩm đã được chuyển sang 'Ngừng bán'.",
    };
  }

  async getFeatured(limit: number = 10) {
    return prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    });
  }

  async getRelated(productId: string, limit: number = 4) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true,
      },
      take: limit,
      orderBy: { views: "desc" },
      // có thể include category nếu cần
    });
  }
  async applySaleToCategory(
    categoryId: string,
    discountType: "PERCENTAGE" | "FIXED",
    discountValue: number
  ) {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
    });

    if (products.length === 0) {
      throw new NotFoundError("No products found in this category");
    }

    const ops = products.map((p) => {
      const basePrice = Number(p.price);
      let salePrice: number;

      if (discountType === "PERCENTAGE") {
        salePrice = basePrice * (1 - discountValue / 100);
      } else {
        salePrice = basePrice - discountValue;
      }

      if (salePrice < 0) salePrice = 0;

      return prisma.product.update({
        where: { id: p.id },
        data: { salePrice },
      });
    });

    await prisma.$transaction(ops);

    return { updated: products.length };
  }
  async clearSaleByCategory(categoryId: string) {
    const result = await prisma.product.updateMany({
      where: { categoryId },
      data: { salePrice: null },
    });

    return { updated: result.count };
  }
}
