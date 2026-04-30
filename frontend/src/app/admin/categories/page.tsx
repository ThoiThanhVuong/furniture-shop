'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, FolderTree, X } from 'lucide-react';
import { categoriesAPI } from '@/services/api';
import { Category } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 👇 image giờ là file, không validate URL nữa
const categorySchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.any().optional(), // FileList
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // 👈 preview

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setValue('name', category.name);
      setValue('slug', category.slug);
      setValue('description', category.description || '');
      setValue('parentId', category.parentId || '');
      // ❌ không set image (file input không set sẵn được)
      setImagePreview(category.image || null);
    } else {
      setEditingCategory(null);
      reset();
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
    setImagePreview(null);
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      const file = (data.image as FileList | undefined)?.[0];

      // Dùng FormData để gửi file
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      if (data.parentId) formData.append('parentId', data.parentId);
      if (file) {
        formData.append('image', file); // 👈 field "image" trùng với BE
      }

      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoriesAPI.create(formData as any);
        toast.success('Tạo danh mục thành công');
      }

      handleCloseModal();
      loadCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await categoriesAPI.delete(id);
      toast.success('Đã xóa danh mục');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa danh mục');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentCategories = filteredCategories.filter((cat) => !cat.parentId);
  const getSubCategories = (parentId: string) =>
    filteredCategories.filter((cat) => cat.parentId === parentId);

  // cần giữ register cho image để custom onChange
  const imageField = register('image');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
          <p className="text-gray-600">Quản lý danh mục sản phẩm trong hệ thống</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Chưa có danh mục nào</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              Thêm danh mục đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {parentCategories.map((parent) => {
              const subCategories = getSubCategories(parent.id);
              return (
                <div key={parent.id}>
                  {/* Parent Category */}
                  <div className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {parent.image ? (
                            <img
                              src={parent.image}
                              alt={parent.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <FolderTree className="w-8 h-8 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold mb-1">
                            {parent.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            Slug: {parent.slug}
                          </p>
                          {parent.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {parent.description}
                            </p>
                          )}
                          {subCategories.length > 0 && (
                            <p className="text-sm text-primary-600 mt-2">
                              {subCategories.length} danh mục con
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(parent)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(parent.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sub Categories */}
                  {subCategories.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                {sub.image ? (
                                  <img
                                    src={sub.image}
                                    alt={sub.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <FolderTree className="w-5 h-5 text-primary-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-1">
                                  {sub.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {sub.slug}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleOpenModal(sub)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue('name', value);
                    if (!editingCategory) {
                      setValue('slug', generateSlug(value));
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ví dụ: Bàn ghế"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  {...register('slug')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ban-ghe"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Danh mục cha
                </label>
                <select
                  {...register('parentId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Không có --</option>
                  {categories
                    .filter((cat) => !cat.parentId && cat.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mô tả về danh mục..."
                />
              </div>

              {/* 🔥 Hình ảnh: chọn file */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hình ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...imageField}
                  onChange={(e) => {
                    imageField.onChange(e);
                    const file = e.target.files?.[0];
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Xem trước:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
