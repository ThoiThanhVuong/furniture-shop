import prisma from "../../utils/db";
import { NotFoundError } from "../../utils/errors";

export class CategoryService {
  async getAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          take: 10,
        },
      },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }

  async create(data: any) {
    return prisma.category.create({
      data: {
        ...data,
        parentId: data.parentId || null,
        image: data.image ?? null,
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      parentId: data.parentId || null,
    };

    // CHỈ đụng tới image nếu field "image" tồn tại trong data
    if ("image" in data) {
      // nếu gửi image = "" => xóa ảnh (set null)
      updateData.image = data.image || null;
    }

    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await prisma.category.delete({ where: { id } });
  }
}
