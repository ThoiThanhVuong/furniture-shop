import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from "@prisma/client";
import prisma from "../../utils/db";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { sendOrderConfirmationEmail } from "../../utils/email";
import { momoService } from "../payments/momo.service";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderData {
  userId: string;
  items: OrderItemInput[];
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  voucherCode?: string;
  selectedProductIds?: string[];
}

// Kiểu trả về khi tạo order
interface CreateOrderResult {
  order: any; // bạn có thể refine lại kiểu này nếu muốn
  momo: {
    payUrl?: string;
    deeplink?: string;
    qrCodeUrl?: string;
    resultCode: number;
    message: string;
  } | null;
}

export class OrderService {
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `ORD${timestamp}${random}`;
  }

  async createOrder(data: CreateOrderData): Promise<CreateOrderResult> {
    // ===== 1. Validate items =====
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError("No items selected");
    }

    // ===== 2. Lấy thông tin product từ DB =====
    const productIds = data.items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== data.items.length) {
      throw new BadRequestError("Some products do not exist");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // ===== 3. Validate tồn kho + trạng thái + tính subtotal =====
    let subtotal = 0;

    for (const item of data.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new BadRequestError(`Product not found`);
      }

      if (!product.isActive) {
        throw new BadRequestError(`Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Product ${product.name} is out of stock (only ${product.stock} left)`
        );
      }

      const price = product.salePrice || product.price;
      subtotal += Number(price) * item.quantity;
    }

    // ===== 4. Xử lý voucher =====
    let discount = 0;
    let voucherId: string | null = null;

    if (data.voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: data.voucherCode },
      });

      if (!voucher) {
        throw new BadRequestError("Invalid voucher code");
      }

      if (!voucher.isActive) {
        throw new BadRequestError("Voucher is not active");
      }

      const now = new Date();
      if (voucher.startDate > now || voucher.endDate < now) {
        throw new BadRequestError("Voucher is expired");
      }

      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        throw new BadRequestError("Voucher usage limit reached");
      }

      if (voucher.minOrderValue && subtotal < Number(voucher.minOrderValue)) {
        throw new BadRequestError(
          `Minimum order value of ${voucher.minOrderValue} required`
        );
      }

      if (voucher.discountType === "PERCENTAGE") {
        discount = (subtotal * Number(voucher.discountValue)) / 100;
        if (voucher.maxDiscount) {
          discount = Math.min(discount, Number(voucher.maxDiscount));
        }
      } else {
        discount = Number(voucher.discountValue);
      }

      voucherId = voucher.id;
    }

    // ===== 5. Phí ship & tổng tiền =====
    // Lấy địa chỉ shop = địa chỉ của 1 admin đang active
    const admin = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
        isActive: true,
        address: { not: null },
      },
      select: { address: true },
    });

    const normalizeAddress = (addr: string) =>
      addr.replace(/\s+/g, "").toLowerCase();

    const isPickupAtStore =
      !!admin?.address &&
      normalizeAddress(data.shippingAddress) ===
        normalizeAddress(admin.address);

    const shippingFee = isPickupAtStore ? 0 : subtotal >= 1000000 ? 0 : 30000; // Free ship > 1M nếu không nhận tại cửa hàng

    const total = subtotal - discount + shippingFee;

    // ===== 6. Tạo Order + OrderItems =====
    const order = await prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        userId: data.userId,
        status: OrderStatus.PENDING,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        subtotal,
        discount,
        shippingFee,
        total,
        voucherCode: data.voucherCode,
        voucherId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        items: {
          create: data.items.map((item) => {
            const product = productMap.get(item.productId)!;
            const price = product.salePrice || product.price;

            return {
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              price,
              quantity: item.quantity,
              subtotal: Number(price) * item.quantity,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true, // cho FE đọc product.image,...
          },
        },
      },
    });

    // ===== 7. Cập nhật stock & sales =====
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          sales: { increment: item.quantity },
        },
      });
    }

    // ===== 8. Tăng usedCount của voucher nếu có =====
    if (voucherId) {
      await prisma.voucher.update({
        where: { id: voucherId },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    // ===== 9. Xóa các sản phẩm đã đặt khỏi Cart của user (nếu có) =====
    if (data.selectedProductIds && data.selectedProductIds.length > 0) {
      const cart = await prisma.cart.findFirst({
        where: { userId: data.userId },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            productId: { in: data.selectedProductIds },
          },
        });
      }
    }

    // ===== 10. Gửi email xác nhận (không await) =====
    sendOrderConfirmationEmail(data.customerEmail, order.orderNumber, {
      total: order.total,
    }).catch((err) => {
      console.error("Failed to send order confirmation email:", err);
    });

    // ===== 11. Nếu thanh toán MoMo -> tạo payment & trả payUrl =====
    if (data.paymentMethod === PaymentMethod.MOMO) {
      const momoResult = await momoService.createPayment(order);

      if (momoResult.resultCode !== 0) {
        throw new BadRequestError(
          `MoMo payment init failed: ${momoResult.message}`
        );
      }

      return {
        order,
        momo: {
          payUrl: momoResult.payUrl,
          deeplink: momoResult.deeplink,
          qrCodeUrl: momoResult.qrCodeUrl,
          resultCode: momoResult.resultCode,
          message: momoResult.message,
        },
      };
    }

    // ===== 12. Nếu COD / BANK_TRANSFER -> không cần MoMo =====
    return {
      order,
      momo: null,
    };
  }

  async getOrdersByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  image: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
        product: item.product ? { image: item.product.image } : undefined,
      })),
    }));

    return {
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        voucher: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundError("Order not found");
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    cancelReason?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const updateData: any = { status };

    if (status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
      updateData.paymentStatus = PaymentStatus.PAID;
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      if (cancelReason) {
        updateData.cancelReason = cancelReason;
      }
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            sales: { decrement: item.quantity },
          },
        });
      }
    }

    return prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
      },
    });
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.userId !== userId) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError("Only pending orders can be cancelled");
    }

    return this.updateOrderStatus(
      orderId,
      OrderStatus.CANCELLED,
      reason || "User cancelled order"
    );
  }

  // Xác nhận thanh toán cho đơn hàng
  async confirmPayment(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new NotFoundError("Order not found");

    if (userId && order.userId !== userId) {
      throw new BadRequestError("Not allowed");
    }

    if (order.paymentStatus === "PAID") {
      throw new BadRequestError("Order already paid");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: OrderStatus.PROCESSING,
      },
    });
  }
  // Thêm lại sản phẩm từ đơn hàng cũ vào giỏ hàng
  async reorderToCart(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundError("Order not found");
    if (order.userId !== userId) throw new BadRequestError("Not allowed");

    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    let addedCount = 0;

    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive || product.stock === 0) continue;

      const desiredQty = Math.min(item.quantity, product.stock);

      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
      });

      if (existing) {
        const newQty = Math.min(existing.quantity + desiredQty, product.stock);
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: desiredQty,
          },
        });
      }

      addedCount++;
    }

    if (addedCount === 0) {
      throw new BadRequestError(
        "Không sản phẩm nào có thể thêm lại vào giỏ hàng"
      );
    }

    return { message: "Đã thêm sản phẩm vào giỏ hàng từ đơn cũ" };
  }

  // Hủy các đơn MoMo quá hạn chưa thanh toán
  async cancelExpiredUnpaidMomoOrders(timeoutMinutes = 30) {
    const now = Date.now();
    const threshold = new Date(now - timeoutMinutes * 60 * 1000);

    // Tìm các order MoMo quá hạn
    const orders = await prisma.order.findMany({
      where: {
        paymentMethod: PaymentMethod.MOMO,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        createdAt: { lt: threshold },
      },
      select: { id: true },
    });

    for (const o of orders) {
      // dùng logic có sẵn (restore stock khi CANCELLED)
      await this.updateOrderStatus(
        o.id,
        OrderStatus.CANCELLED,
        "AUTO_CANCEL_MOMO_TIMEOUT"
      );
    }

    return {
      cancelledCount: orders.length,
      timeoutMinutes,
    };
  }

  // Tạo thanh toán MoMo cho một order đã tồn tại
  async createMomoPaymentForOrder(orderId: string, userId: string) {
    // Lấy order gốc (không include items cũng được, MoMo chỉ cần tổng tiền)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Đảm bảo đúng user
    if (order.userId !== userId) {
      throw new BadRequestError("Not allowed");
    }

    // Chỉ cho phép khi phương thức là MoMo
    if (order.paymentMethod !== PaymentMethod.MOMO) {
      throw new BadRequestError("Order payment method is not MoMo");
    }

    // Chỉ cho phép khi chưa thanh toán và còn PENDING
    if (order.paymentStatus !== PaymentStatus.UNPAID) {
      throw new BadRequestError("Order is already processed or paid");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError("Only pending orders can be paid via MoMo");
    }

    // Gọi MoMo để tạo link thanh toán
    const momoResult = await momoService.createPayment(order);

    if (momoResult.resultCode !== 0) {
      throw new BadRequestError(
        `MoMo payment init failed: ${momoResult.message}`
      );
    }

    // Lấy lại order full (include items, product, voucher) cho FE
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        voucher: true,
      },
    });

    return {
      order: fullOrder,
      momo: {
        payUrl: momoResult.payUrl,
        deeplink: momoResult.deeplink,
        qrCodeUrl: momoResult.qrCodeUrl,
        resultCode: momoResult.resultCode,
        message: momoResult.message,
      },
    };
  }
}
