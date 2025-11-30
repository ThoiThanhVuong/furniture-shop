"use client";

import { useEffect, useState } from "react";
import { usersAPI } from "@/services/api";
import { User } from "@/types";
import { toast } from "sonner";

interface AdminUser extends User {
  isActive: boolean; // backend trả thêm field này
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ page, limit: 10 });

      // giả định res.data.data = { users, pagination }
      const { users, pagination } = res.data.data;

      setUsers((users ?? []) as AdminUser[]);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("vi-VN");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Người dùng</h2>
        <p className="text-gray-600">Quản lý người dùng trong hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <p className="font-semibold">Danh sách người dùng</p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có người dùng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    SĐT
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{user.name}</td>
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">{user.phone || "—"}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {formatDate(user.createdAt)}
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
