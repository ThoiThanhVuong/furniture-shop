import prisma from "../../utils/db";
import { NotFoundError, BadRequestError } from "../../utils/errors";

export class CartService {
  async getCart(userId: string) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            // Lấy full product (trong đó có field image)
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number) {
    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!product.isActive) {
      throw new BadRequestError("Product is not available");
    }

    if (product.stock < quantity) {
      throw new BadRequestError(
        `Only ${product.stock} items available in stock`
      );
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestError(
          `Only ${product.stock} items available in stock`
        );
      }

      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
        },
      });
    }

    // Add new item
    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundError("Cart item not found");
    }

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    if (item.product.stock < quantity) {
      throw new BadRequestError(
        `Only ${item.product.stock} items available in stock`
      );
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
      },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundError("Cart item not found");
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }
}
