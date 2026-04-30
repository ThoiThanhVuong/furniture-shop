"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { categoriesAPI, productsAPI } from "@/services/api";
import { Category, Product } from "@/types";
import { toast } from "sonner";

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    if (!productId) return;
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getById(productId),
      ]);

      setCategories(catRes.data.data ?? []);
      const p = prodRes.data.data;
      setProduct(p);

      setName(p.name);
      setSlug(p.slug);
      setDescription(p.description || "");
      setPrice(p.price);
      setSalePrice(p.salePrice ?? "");
      setSku(p.sku);
      setStock(p.stock);
      setCategoryId(p.categoryId);
      setIsFeatured(p.isFeatured);
      setIsActive(p.isActive);
      if (p.image) setImagePreview(p.image);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu sản phẩm");
      router.push("/admin/products");
    } finally {
      setLoading(false);
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
    if (!price) {
      toast.error("Vui lòng nhập giá");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      formData.append("description", description.trim());
      formData.append("price", String(price));
      if (salePrice !== "" && salePrice !== undefined) {
        formData.append("salePrice", String(salePrice));
      } else {
        // nếu muốn clear salePrice ở backend, có thể dùng giá trị đặc biệt
        formData.append("salePrice", "");
      }
      formData.append("sku", sku.trim());
      formData.append("stock", String(stock || 0));
      formData.append("categoryId", categoryId);
      formData.append("isFeatured", String(isFeatured));
      formData.append("isActive", String(isActive));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await productsAPI.update(productId, formData);
      toast.success("Cập nhật sản phẩm thành công");
      router.push("/admin/products");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật sản phẩm"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!product) {
    return <div>Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Sửa sản phẩm: <span className="text-primary-600">{product.name}</span>
        </h2>
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
                onChange={(e) => setName(e.target.value)}
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

          {/* Cột phải */}
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
                    alt={product.name}
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
            disabled={saving}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
