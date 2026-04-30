import { Request, Response } from "express";
import prisma from "../../utils/db";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";

export const getShopInfo = asyncHandler(
  async (_req: Request, res: Response) => {
    const admin = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
        isActive: true,
        address: { not: null },
      },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    if (!admin) {
      return sendSuccess(res, null, "No shop info");
    }

    return sendSuccess(
      res,
      {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        address: admin.address,
      },
      "Shop info retrieved successfully"
    );
  }
);
