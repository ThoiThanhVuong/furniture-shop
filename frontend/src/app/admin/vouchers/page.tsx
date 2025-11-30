"use client";

import { useEffect, useState } from "react";
import { vouchersAPI } from "@/services/api";
import { Voucher } from "@/types";
import { toast } from "sonner";

type VoucherForm = {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  isActive: boolean;
};

const formatDateInput = (date: string) =>
  new Date(date).toISOString().slice(0, 10);

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<VoucherForm>(() => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    return {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 0,
      maxDiscount: undefined,
      usageLimit: 100,
      startDate: formatDateInput(today.toISOString()),
      endDate: formatDateInput(nextMonth.toISOString()),
      isActive: true,
    };
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await vouchersAPI.getAll();
      setVouchers(res.data.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    setForm({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 0,
      maxDiscount: undefined,
      usageLimit: 100,
      startDate: formatDateInput(today.toISOString()),
      endDate: formatDateInput(nextMonth.toISOString()),
      isActive: true,
    });
  };

  const openCreateForm = () => {
    setEditingVoucher(null);
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      description: voucher.description ?? "",
      discountType: voucher.discountType, // PERCENTAGE/FIXED
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      startDate: formatDateInput(voucher.startDate),
      endDate: formatDateInput(voucher.endDate),
      isActive: voucher.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVoucher(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as any;

    // numeric fields
    const numericFields = [
      "discountValue",
      "minOrderValue",
      "maxDiscount",
      "usageLimit",
    ];

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : numericFields.includes(name)
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // build payload đúng với VoucherInput (backend expect)
      const payload: any = {
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        discountType: form.discountType, // PERCENTAGE/FIXED
        discountValue: Number(form.discountValue),
        isActive: form.isActive,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };

      if (form.minOrderValue !== undefined)
        payload.minOrderValue = Number(form.minOrderValue);
      if (form.maxDiscount !== undefined)
        payload.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit !== undefined)
        payload.usageLimit = Number(form.usageLimit);

      if (editingVoucher) {
        await vouchersAPI.update(editingVoucher.id, payload);
        toast.success("Cập nhật voucher thành công");
      } else {
        await vouchersAPI.create(payload);
        toast.success("Tạo voucher thành công");
      }

      closeForm();
      loadVouchers();
    } catch (error) {
      console.error(error);
      toast.error("Lưu voucher thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (voucher: Voucher) => {
    if (!window.confirm(`Bạn có chắc muốn xóa voucher "${voucher.code}"?`)) {
      return;
    }
    try {
      await vouchersAPI.delete(voucher.id);
      toast.success("Xóa voucher thành công");
      loadVouchers();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa voucher");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  const totalPages = Math.max(1, Math.ceil(vouchers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = vouchers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Voucher</h2>
          <p className="text-gray-600">Quản lý các mã giảm giá</p>
        </div>

        <button
          onClick={openCreateForm}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
        >
          + Tạo voucher
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <p className="font-semibold">Danh sách voucher</p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Đang tải...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có voucher nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Giảm
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">
                    Đơn tối thiểu
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Lượt dùng
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{v.code}</td>
                    <td className="px-6 py-3 max-w-xs">
                      <div className="line-clamp-2">
                        {v.description ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {v.discountType === "PERCENTAGE"
                        ? `${v.discountValue}%${
                            v.maxDiscount
                              ? ` (tối đa ${formatPrice(v.maxDiscount)})`
                              : ""
                          }`
                        : formatPrice(v.discountValue)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {v.minOrderValue
                        ? formatPrice(v.minOrderValue)
                        : "Không yêu cầu"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {v.usedCount}/{v.usageLimit ?? "∞"}
                    </td>
                    <td className="px-6 py-3 text-center text-xs">
                      {formatDate(v.startDate)} - {formatDate(v.endDate)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          v.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {v.isActive ? "Đang hoạt động" : "Ngừng"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditForm(v)}
                          className="px-2 py-1 text-xs rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="px-2 py-1 text-xs rounded border border-red-500 text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
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
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-primary-600 text-white border-primary-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Modal tạo / sửa voucher */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingVoucher ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mã voucher
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loại giảm giá
                  </label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giá trị giảm
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    min={0}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nếu là phần trăm: 10 = 10%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Đơn hàng tối thiểu
                  </label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={form.minOrderValue ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    min={0}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống nếu không yêu cầu.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giảm tối đa (nếu là %)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={form.maxDiscount ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Số lượt sử dụng
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống = không giới hạn.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Đang hoạt động
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingVoucher
                    ? "Cập nhật"
                    : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
