"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ordersAPI } from "@/services/api";
import { Order, OrderStatus } from "@/types";
import { toast } from "sonner";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      //  API admin để xem chi tiết mọi đơn
      const res = await ordersAPI.getAdminById(params.id);
      setOrder(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    // Không cho cập nhật nếu đã hoàn tất hoặc hủy
    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      toast.error("Đơn hàng đã kết thúc, không thể cập nhật trạng thái.");
      return;
    }
    try {
      setUpdating(true);
      await ordersAPI.updateStatus(order.id, status);
      toast.success("Cập nhật trạng thái thành công");
      await loadOrder();
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("vi-VN");

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!order) {
    return <div className="p-6">Không tìm thấy đơn hàng</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Đơn hàng {order.orderNumber}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Ngày tạo: {formatDateTime(order.createdAt)}
          </p>
          <p className="text-gray-600 text-sm">
            Khách: {order.customerName} — {order.customerEmail} —{" "}
            {order.customerPhone}
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      {/* Card chính */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Trạng thái + actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Trạng thái hiện tại</p>
            <p className="font-semibold text-base">{order.status}</p>
            <p className="text-sm text-gray-500 mt-1">
              Phương thức thanh toán: {order.paymentMethod} —{" "}
              {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={ updating ||
                          order.status === s ||     
                          order.status === "COMPLETED"||
                          order.status === "CANCELLED"  }
                className={`px-3 py-1 rounded text-xs border ${
                  order.status === s
                    ? "bg-primary-600 text-white border-primary-600"
                    : "hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Thông tin giao hàng */}
        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
            <p>Tên: {order.customerName}</p>
            <p>Email: {order.customerEmail}</p>
            <p>Điện thoại: {order.customerPhone}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>
            <p>{order.shippingAddress}</p>
            {order.notes && (
              <>
                <p className="font-semibold mt-2">Ghi chú:</p>
                <p>{order.notes}</p>
              </>
            )}
          </div>
        </div>

        {/* Sản phẩm trong đơn */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Sản phẩm</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Tên sản phẩm</th>
                  <th className="px-3 py-2 text-left">SKU</th>
                  <th className="px-3 py-2 text-right">Giá</th>
                  <th className="px-3 py-2 text-center">SL</th>
                  <th className="px-3 py-2 text-right">Tạm tính</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{item.productName}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {item.productSku}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatPrice(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="border-t pt-4 space-y-1 text-sm max-w-sm ml-auto">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí ship</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Tổng cộng</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
