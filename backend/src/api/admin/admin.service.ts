import { OrderStatus } from "@prisma/client";
import prisma from "../../utils/db";
import dayjs from "dayjs";
import { sendOrderStatusUpdateEmail } from "../../utils/email";
export class AdminService {
  // Dashboard Statistics
  async getDashboardStats() {
    const today = dayjs().startOf("day").toDate();
    const thisMonth = dayjs().startOf("month").toDate();
    const thisYear = dayjs().startOf("year").toDate();

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      yearOrders,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      yearRevenue,
      totalUsers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      // Orders count
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: thisYear } } }),

      // Revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: OrderStatus.COMPLETED },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: OrderStatus.COMPLETED,
          createdAt: { gte: today },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: OrderStatus.COMPLETED,
          createdAt: { gte: thisMonth },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: OrderStatus.COMPLETED,
          createdAt: { gte: thisYear },
        },
      }),

      // Other stats
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 10 } } }),
    ]);

    return {
      orders: {
        total: totalOrders,
        today: todayOrders,
        month: monthOrders,
        year: yearOrders,
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
        today: todayRevenue._sum.total || 0,
        month: monthRevenue._sum.total || 0,
        year: yearRevenue._sum.total || 0,
      },
      users: totalUsers,
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
    };
  }

  // Top selling products
  async getTopSellingProducts(limit: number = 10) {
    return prisma.product.findMany({
      take: limit,
      orderBy: { sales: "desc" },
      include: {
        category: {
          select: { name: true },
        },
      },
    });
  }

  // Top customers
  async getTopCustomers(limit: number = 10) {
    const customers = await prisma.order.groupBy({
      by: ["userId"],
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: limit,
    });

    const customersWithDetails = await Promise.all(
      customers.map(async (customer) => {
        const user = await prisma.user.findUnique({
          where: { id: customer.userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        });

        return {
          ...user,
          totalSpent: customer._sum.total || 0,
          orderCount: customer._count.id,
        };
      })
    );

    return customersWithDetails;
  }

  // Revenue by period
  async getRevenueTrend(days: number = 30) {
    const startDate = dayjs().subtract(days, "day").startOf("day").toDate();

    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const revenueByDay: Record<string, number> = {};

    orders.forEach((order) => {
      const date = dayjs(order.createdAt).format("YYYY-MM-DD");
      if (!revenueByDay[date]) {
        revenueByDay[date] = 0;
      }
      revenueByDay[date] += Number(order.total);
    });

    return Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  // All orders for admin
  async getAllOrders(filters: {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, status, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        voucher: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })),
    };
  }

  // Recent orders
  async getRecentOrders(limit: number = 5) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      // include: {
      //   // nếu muốn kèm user:
      //   // user: { select: { id: true, name: true, email: true } },
      // },
    });
  }

  // Update order status
  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    //Không cho cập nhật nếu đơn đã hoàn tất hoặc đã hủy
    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new Error("Completed or cancelled orders cannot be updated");
    }

    const updateData: any = { status };

    if (status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();

      // Restore stock
      const items = await prisma.orderItem.findMany({
        where: { orderId },
      });

      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            sales: { decrement: item.quantity },
          },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Gửi email thông báo trạng thái nếu đơn có user gắn với
    if (order.user?.email) {
      // Map enum -> text hiển thị đẹp cho user (tuỳ enum bạn đang dùng)
      const statusText =
        status === OrderStatus.PENDING
          ? "Đang chờ xử lý"
          : status === OrderStatus.PROCESSING
            ? "Đang xử lý"
            : status === OrderStatus.SHIPPING
              ? "Đang giao hàng"
              : status === OrderStatus.COMPLETED
                ? "Hoàn tất"
                : status === OrderStatus.CANCELLED
                  ? "Đã hủy"
                  : String(status);

      await sendOrderStatusUpdateEmail(
        order.user.email,
        order.user.name || null,
        updatedOrder.id,
        statusText
      );
    }

    return updatedOrder;
  }

  // User management
  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }
}
