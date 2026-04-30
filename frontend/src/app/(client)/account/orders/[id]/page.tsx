"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, ArrowLeft, X, QrCode, ShoppingBag } from "lucide-react";

import { ordersAPI, cartAPI } from "@/services/api";
import { useAuthStore, useCartStore } from "@/store/useStore";
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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { setItemsFromServer } = useCartStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingWithMomo, setPayingWithMomo] = useState(false);

  const orderId = params?.id as string | undefined;

  // ------------ Helpers ------------
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ------------ Fetch order ------------
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await ordersAPI.getById(orderId);
        setOrder(res.data.data);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Không tìm thấy đơn hàng"
        );
        router.push("/account/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId, router]);

  // ------------ Actions ------------
  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      const res = await ordersAPI.cancel(order.id);
      setOrder(res.data.data);
      toast.success("Đã hủy đơn hàng");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handleReorder = async () => {
    if (!order) return;

    try {
      await ordersAPI.reorder(order.id);

      const cartRes = await cartAPI.getCart();
      const cart = cartRes.data.data;
      setItemsFromServer(cart.items || []);

      toast.success("Đã thêm sản phẩm từ đơn cũ vào giỏ hàng");
      router.push("/cart");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Không thể mua lại đơn hàng"
      );
    }
  };

  // Chỉ cho thanh toán lại bằng MoMo khi: phương thức là MOMO, chưa thanh toán, còn PENDING
  const canPayWithMomo =
    order &&
    order.paymentMethod === "MOMO" &&
    order.paymentStatus === "UNPAID" &&
    order.status === "PENDING";

  const handlePayWithMomo = async () => {
    if (!order) return;

    try {
      setPayingWithMomo(true);

      const res = await ordersAPI.payWithMomo(order.id);
      const { momo } = res.data.data || {};

      if (momo && momo.payUrl) {
        window.location.href = momo.payUrl;
      } else {
        toast.error("Không tạo được link thanh toán MoMo");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Không thể tạo thanh toán MoMo cho đơn hàng này"
      );
    } finally {
      setPayingWithMomo(false);
    }
  };

  // ------------ Render ------------
  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy đơn hàng
            </h2>
            <Link
              href="/account/orders"
              className="inline-block mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/account/orders")}
          className="inline-flex items-center gap-2 text-primary-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đơn hàng của tôi
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Đơn hàng #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Ngày đặt:{" "}
              <span className="font-medium">
                {formatDate(order.createdAt)}
              </span>
            </p>
            <p className="text-gray-600 text-sm">
              Phương thức thanh toán:{" "}
              <span className="font-medium">{order.paymentMethod}</span> —{" "}
              <span
                className={
                  order.paymentStatus === "PAID"
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {order.paymentStatus === "PAID"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status]
              }`}
            >
              {statusLabels[order.status]}
            </span>

            <div className="flex gap-2">
              {/* Hủy đơn khi đang chờ xác nhận */}
              {order.status === "PENDING" && (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                >
                  <X className="w-4 h-4" />
                  Hủy đơn
                </button>
              )}

              {/* Mua lại khi đã giao hoặc đã hủy */}
              {(order.status === "COMPLETED" ||
                order.status === "CANCELLED") && (
                <button
                  onClick={handleReorder}
                  className="flex items-center gap-2 px-4 py-2 border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Mua lại
                </button>
              )}

              {/* Thanh toán MoMo nếu đủ điều kiện */}
              {canPayWithMomo && (
                <button
                  onClick={handlePayWithMomo}
                  disabled={payingWithMomo}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm disabled:opacity-60"
                >
                  <QrCode className="w-4 h-4" />
                  {payingWithMomo
                    ? "Đang chuyển tới MoMo..."
                    : "Thanh toán bằng MoMo"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: shipping + items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Thông tin giao hàng
              </h2>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-gray-700">{order.customerPhone}</p>
              <p className="text-gray-700">{order.customerEmail}</p>
              <p className="text-gray-700 mt-2 whitespace-pre-line">
                {order.shippingAddress}
              </p>
              {order.notes && (
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Ghi chú: </span>
                  {order.notes}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
              <div className="divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.image && (
                        <Image
                          src={
                            item.product.image.startsWith("/")
                              ? item.product.image
                              : "/" + item.product.image
                          }
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Mã SP: {item.productSku}
                      </p>
                      <p className="text-sm text-gray-600">
                        Số lượng: x{item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Tổng: {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Tổng quan đơn hàng</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá</span>
                <span className="font-medium">
                  -{formatPrice(order.discount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium">
                  {order.shippingFee === 0
                    ? "Miễn phí"
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base">
                <span className="font-bold">Thành tiền</span>
                <span className="font-bold text-primary-600 text-lg">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {order.paymentStatus === "PAID" && (
              <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Đơn hàng đã được thanh toán, chúng tôi sẽ xử lý sớm nhất.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
