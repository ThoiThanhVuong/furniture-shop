"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { ordersAPI } from "@/services/api";
import { Order, OrderStatus } from "@/types";
import { toast } from "sonner";

const STATUS_OPTIONS: Array<{ label: string; value?: OrderStatus }> = [
  { label: "Tất cả", value: undefined },
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đang xử lý", value: "PROCESSING" },
  { label: "Đang giao", value: "SHIPPING" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bộ lọc
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "" >("");
  const [startDate, setStartDate] = useState<string>(""); // "YYYY-MM-DD"
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const { orders, pagination } = res.data.data;

      setOrders(orders ?? []);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    loadOrders();
  };

  const handleClearFilter = () => {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    loadOrders();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("vi-VN");

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
      case "SHIPPING":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Đơn hàng</h2>
        <p className="text-gray-600">Quản lý tất cả đơn hàng trên hệ thống</p>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          {/* Filter trạng thái */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "")
              }
              className="border rounded-lg px-3 py-2 text-sm min-w-[150px]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Từ ngày */}
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Đến ngày */}
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClearFilter}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Xóa lọc
          </button>
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <p className="font-semibold">Danh sách đơn hàng</p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có đơn hàng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-3">
                      {order.customerName}
                      <div className="text-xs text-gray-500">
                        {order.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1
                    ? "bg-primary-600 text-white border-primary-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
