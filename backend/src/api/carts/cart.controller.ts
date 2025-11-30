import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response";

const cartService = new CartService();

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.userId);
  sendSuccess(res, cart, "Cart retrieved successfully");
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body;
  const item = await cartService.addItem(req.user!.userId, productId, quantity);
  sendCreated(res, item, "Item added to cart");
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const item = await cartService.updateItem(
    req.user!.userId,
    req.params.itemId,
    quantity
  );
  sendSuccess(res, item, "Cart item updated");
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  await cartService.removeItem(req.user!.userId, req.params.itemId);
  sendNoContent(res);
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await cartService.clearCart(req.user!.userId);
  sendNoContent(res);
});
