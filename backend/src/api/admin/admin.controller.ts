import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { OrderStatus } from "@prisma/client";

const adminService = new AdminService();

export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const baseStats = await adminService.getDashboardStats();

    // lấy thêm top products & recent orders
    const [topProductsRaw, recentOrders] = await Promise.all([
      adminService.getTopSellingProducts(5),
      adminService.getRecentOrders(5),
    ]);

    const topProducts = topProductsRaw.map((p) => ({
      product: p,
      soldCount: p.sales,
      revenue: Number(p.price) * p.sales,
    }));

    const response = {
      // map sang DashboardStats FE đang dùng
      totalOrders: baseStats.orders.total,
      totalRevenue: Number(baseStats.revenue.total),
      totalProducts: baseStats.products.total,
      totalUsers: baseStats.users,
      recentOrders,
      topProducts,
    };

    sendSuccess(res, response, "Dashboard data retrieved");
  }
);

export const getTopSellingProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const products = await adminService.getTopSellingProducts(limit);
    sendSuccess(res, products, "Top selling products retrieved");
  }
);

export const getTopCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const customers = await adminService.getTopCustomers(limit);
    sendSuccess(res, customers, "Top customers retrieved");
  }
);

export const getRevenueTrend = asyncHandler(
  async (req: Request, res: Response) => {
    const days = req.query.days ? Number(req.query.days) : 30;
    const trend = await adminService.getRevenueTrend(days);
    sendSuccess(res, trend, "Revenue trend retrieved");
  }
);

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as OrderStatus,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = await adminService.getAllOrders(filters);
    sendSuccess(res, result, "Orders retrieved");
  }
);
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await adminService.getOrderById(req.params.id);
    sendSuccess(res, order, "Order retrieved");
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;
    const order = await adminService.updateOrderStatus(req.params.id, status);
    sendSuccess(res, order, "Order status updated");
  }
);

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  const result = await adminService.getAllUsers(page, limit);
  sendSuccess(res, result, "Users retrieved");
});

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { isActive } = req.body;
    const user = await adminService.updateUserStatus(req.params.id, isActive);
    sendSuccess(res, user, "User status updated");
  }
);
