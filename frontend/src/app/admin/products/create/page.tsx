"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { categoriesAPI, productsAPI } from "@/services/api";
import { Category } from "@/types";
import { toast } from "sonner";

export default function AdminCreateProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh mục");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (price === "" || price === null || price === undefined) {
      toast.error("Vui lòng nhập giá");
      return;
    }
    if (price < 0) {
      toast.error("Giá không được nhỏ hơn 0");
      return;
    }
    // Không cho nhập giá sale nếu giá gốc bằng 0
    if (price === 0 && salePrice !== "" && salePrice > 0) {
      toast.error("Sản phẩm giá 0 không thể có giá sale!");
      return;
    }

    // Giá sale không được >= giá gốc
    if (salePrice !== "" && salePrice >= price && price > 0) {
      toast.error("Giá sale phải nhỏ hơn giá gốc");
      return;
    }
   // Check giá sale không nhỏ hơn 0
    if (salePrice !== "" && salePrice < 0) {
      toast.error("Giá sale không được nhỏ hơn 0");
      return;
    }
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      formData.append("description", description.trim());
      formData.append("price", String(price));
      if (salePrice !== "" && salePrice !== undefined) {
        formData.append("salePrice", String(salePrice));
      }
      formData.append("sku", sku.trim());
      formData.append("stock", String(stock || 0));
      formData.append("categoryId", categoryId);
      formData.append("isFeatured", String(isFeatured));
      formData.append("isActive", String(isActive));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await productsAPI.create(formData);
      toast.success("Tạo sản phẩm thành công");
      router.push("/admin/products");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Không thể tạo sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  const autoSlugify = (value: string) => {
    const slug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(slug);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thêm sản phẩm</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin chính */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên sản phẩm
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) autoSlugify(e.target.value);
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Dùng cho URL, ví dụ: ghe-go-cao-cap
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  SKU
                </label>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Giá
                </label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Giá sale (nếu có)
                </label>
                <input
                  type="number"
                  min={0}
                  value={salePrice}
                  onChange={(e) =>
                    setSalePrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nếu có giá sale, sản phẩm sẽ được coi là đang khuyến mãi.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tồn kho
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={4}
              />
            </div>
          </div>

          {/* Cột phải: danh mục, trạng thái, ảnh */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Danh mục
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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

            <div className="flex items-center gap-2">
              <input
                id="isFeatured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <label htmlFor="isFeatured" className="text-sm">
                Sản phẩm nổi bật
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="text-sm">
                Đang bán
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ảnh sản phẩm
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm"
              />
              {imagePreview && (
                <div className="mt-3 relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
