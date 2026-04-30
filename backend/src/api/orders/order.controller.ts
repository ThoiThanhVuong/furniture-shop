import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/response";

const orderService = new OrderService();

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.createOrder({
    userId: req.user!.userId,
    ...req.body,
  });

  sendCreated(res, result, "Order created successfully");
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const result = await orderService.getOrdersByUser(
    req.user!.userId,
    page,
    limit
  );

  sendSuccess(res, result, "Orders retrieved successfully");
});

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user!.userId
    );
    sendSuccess(res, order, "Order retrieved successfully");
  }
);

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user!.userId,
    req.body.reason
  );
  sendSuccess(res, order, "Order cancelled successfully");
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const order = await orderService.confirmPayment(
    req.params.id,
    req.user!.userId
  );
  sendSuccess(res, order, "Payment confirmed");
});

export const reorderToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.reorderToCart(
      req.params.id,
      req.user!.userId
    );

    sendSuccess(res, result, "Reordered items added to cart");
  }
);

export const autoCancelExpiredMomo = asyncHandler(
  async (req: Request, res: Response) => {
    const rawTimeout = req.body.timeoutMinutes;
    const timeoutMinutes = rawTimeout !== undefined ? Number(rawTimeout) : 30;

    const result =
      await orderService.cancelExpiredUnpaidMomoOrders(timeoutMinutes);

    sendSuccess(
      res,
      result,
      `Auto cancelled ${result.cancelledCount} expired MoMo orders`
    );
  }
);

export const createMomoPaymentForOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.createMomoPaymentForOrder(
      req.params.id,
      req.user!.userId
    );

    sendSuccess(res, result, "MoMo payment created successfully");
  }
);
