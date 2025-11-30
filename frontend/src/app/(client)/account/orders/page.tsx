"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Eye, X, ShoppingBag } from "lucide-react";
import { useAuthStore, useCartStore } from "@/store/useStore";
import { ordersAPI, cartAPI } from "@/services/api";
import { Order, OrderStatus } from "@/types";
import { toast } from "sonner";

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPING: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setItemsFromServer } = useCartStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      await ordersAPI.cancel(orderId);
      toast.success("Đã hủy đơn hàng");
      loadOrders();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Không thể hủy đơn hàng"
      );
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      // Gọi BE: copy sản phẩm từ order sang cart
      await ordersAPI.reorder(orderId);

      // Sync lại giỏ hàng từ server
      const cartRes = await cartAPI.getCart();
      const cart = cartRes.data.data;
      setItemsFromServer(cart.items || []);

      toast.success("Đã thêm sản phẩm từ đơn cũ vào giỏ hàng");
      router.push("/cart");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Không thể mua lại đơn hàng"
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
          <div className="flex gap-2 p-4 min-w-max">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(statusLabels).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setFilter(status as OrderStatus)}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng</h3>
            <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 p-4 border-b flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mã đơn hàng</p>
                      <p className="font-semibold">{order.orderNumber}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày đặt</p>
                      <p className="font-semibold">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.image && (
                            <img
                              src={
                                item.product.image.startsWith("/")
                                  ? item.product.image
                                  : "/" + item.product.image
                              }
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            x{item.quantity}
                          </p>
                        </div>
                        <div className="font-semibold">
                          {formatPrice(item.subtotal)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600">
                        và {order.items.length - 2} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền</p>
                      <p className="text-xl font-bold text-primary-600">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {/* Hủy đơn nếu đang PENDING */}
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          <X className="w-4 h-4" />
                          Hủy đơn
                        </button>
                      )}

                      {/* Mua lại nếu đã giao hoặc đã hủy */}
                      {(order.status === "COMPLETED" ||
                        order.status === "CANCELLED") && (
                        <button
                          onClick={() => handleReorder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Mua lại
                        </button>
                      )}

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
