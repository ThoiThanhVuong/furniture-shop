import prisma from "../../utils/db";
import { NotFoundError, BadRequestError } from "../../utils/errors";

export class VoucherService {
  async validateVoucher(code: string, orderTotal: number) {
    const voucher = await prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucher) {
      throw new NotFoundError("Voucher not found");
    }

    if (!voucher.isActive) {
      throw new BadRequestError("Voucher is not active");
    }

    if (voucher.startDate > new Date() || voucher.endDate < new Date()) {
      throw new BadRequestError("Voucher is expired");
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestError("Voucher usage limit reached");
    }

    if (voucher.minOrderValue && orderTotal < Number(voucher.minOrderValue)) {
      throw new BadRequestError(
        `Minimum order value of ${voucher.minOrderValue} required`
      );
    }

    let discount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discount = (orderTotal * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscount) {
        discount = Math.min(discount, Number(voucher.maxDiscount));
      }
    } else {
      discount = Number(voucher.discountValue);
    }

    return {
      voucher,
      discount,
      finalTotal: orderTotal - discount,
    };
  }

  async getAll() {
    return prisma.voucher.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: any) {
    return prisma.voucher.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.voucher.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await prisma.voucher.delete({ where: { id } });
  }
  async getAvailable() {
    const now = new Date();

    return prisma.voucher.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { usageLimit: null },
          {
            AND: [
              { usageLimit: { not: null } },
              { usedCount: { lt: prisma.voucher.fields.usageLimit } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
