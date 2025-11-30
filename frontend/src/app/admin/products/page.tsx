"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Percent,
} from "lucide-react";
import { productsAPI, categoriesAPI } from "@/services/api";
import { Product, Category } from "@/types";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State cho modal áp sale
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleCategoryId, setSaleCategoryId] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [saleLoading, setSaleLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh mục");
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({
        page: currentPage,
        limit: 10,
        categoryId: selectedCategory || undefined,
        search: searchTerm || undefined,
        includeInactive: true,
      });
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await productsAPI.delete(id);
      toast.success("Đã xóa sản phẩm");
      loadProducts();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || error.message || "Không thể xóa sản phẩm"
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Áp sale cho category
  const handleApplySale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!saleCategoryId) {
      toast.error("Vui lòng chọn danh mục cần áp khuyến mãi");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      toast.error("Vui lòng nhập giá trị giảm hợp lệ");
      return;
    }

    try {
      setSaleLoading(true);
      await productsAPI.applySaleToCategory({
        categoryId: saleCategoryId,
        discountType,
        discountValue: Number(discountValue),
      });
      toast.success("Đã áp khuyến mãi cho danh mục");
      setShowSaleModal(false);
      setDiscountValue("");
      setSaleCategoryId("");
      loadProducts();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Không thể áp khuyến mãi cho danh mục"
      );
    } finally {
      setSaleLoading(false);
    }
  };

  // Xóa sale của category
  const handleClearSale = async () => {
    if (!saleCategoryId) {
      toast.error("Vui lòng chọn danh mục cần xóa khuyến mãi");
      return;
    }

    if (
      !confirm(
        "Bạn có chắc muốn xóa toàn bộ giá khuyến mãi của danh mục này?"
      )
    ) {
      return;
    }

    try {
      setSaleLoading(true);
      await productsAPI.clearSaleByCategory(saleCategoryId);
      toast.success("Đã xóa khuyến mãi của danh mục");
      setShowSaleModal(false);
      setDiscountValue("");
      setSaleCategoryId("");
      loadProducts();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Không thể xóa khuyến mãi danh mục"
      );
    } finally {
      setSaleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
          <p className="text-gray-600">
            Quản lý danh sách sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSaleModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-sm font-semibold"
          >
            <Percent className="w-4 h-4" />
            Áp khuyến mãi
          </button>
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setCurrentPage(1);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="w-5 h-5" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm nào</p>
            <Link
              href="/admin/products/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm mới
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image && (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {product.category?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold">
                            {formatPrice(product.salePrice || product.price)}
                          </p>
                          {product.salePrice && (
                            <p className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            product.stock > 10
                              ? "text-green-600"
                              : product.stock > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isActive ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Xem"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal áp khuyến mãi theo danh mục */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary-600" />
                Áp khuyến mãi theo danh mục
              </h3>
              <button
                onClick={() => setShowSaleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySale} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Danh mục
                </label>
                <select
                  value={saleCategoryId}
                  onChange={(e) => setSaleCategoryId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Kiểu giảm giá
                </label>
                <div className="flex gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="discountType"
                      value="PERCENTAGE"
                      checked={discountType === "PERCENTAGE"}
                      onChange={() => setDiscountType("PERCENTAGE")}
                    />
                    <span>Phần trăm (%)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="discountType"
                      value="FIXED"
                      checked={discountType === "FIXED"}
                      onChange={() => setDiscountType("FIXED")}
                    />
                    <span>Số tiền cố định</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Giá trị giảm
                </label>
                <input
                  type="number"
                  min={0}
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  - Nếu là phần trăm: 10 = giảm 10% giá sản phẩm.
                  <br />
                  - Nếu là số tiền cố định: 50000 = giảm 50.000đ.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={handleClearSale}
                  className="text-sm text-red-600 hover:underline"
                  disabled={saleLoading}
                >
                  Xóa khuyến mãi danh mục
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaleModal(false)}
                    className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
                    disabled={saleLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saleLoading}
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
                  >
                    {saleLoading ? "Đang áp..." : "Áp khuyến mãi"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
