import { Request, Response } from "express";
import { VoucherService } from "./voucher.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response";

const voucherService = new VoucherService();

export const validateVoucher = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, orderTotal } = req.body;
    const result = await voucherService.validateVoucher(code, orderTotal);
    sendSuccess(res, result, "Voucher is valid");
  }
);

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const vouchers = await voucherService.getAll();
  sendSuccess(res, vouchers);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const voucher = await voucherService.create(req.body);
  sendCreated(res, voucher);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const voucher = await voucherService.update(req.params.id, req.body);
  sendSuccess(res, voucher);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await voucherService.delete(req.params.id);
  sendNoContent(res);
});
export const getAvailable = asyncHandler(
  async (_req: Request, res: Response) => {
    const vouchers = await voucherService.getAvailable();
    sendSuccess(res, vouchers);
  }
);
