'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Grid3x3, LayoutGrid, ArrowRight, Package } from 'lucide-react';
import { categoriesAPI, productsAPI } from '@/services/api';
import { Category } from '@/types';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      const categoriesData = response.data.data;
      setCategories(categoriesData);

      // Load product count for each category
      const counts: Record<string, number> = {};
      await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const productsRes = await productsAPI.getAll({
              categoryId: category.id,
              limit: 1,
            });
            counts[category.id] = productsRes.data.data.pagination.total;
          } catch (error) {
            counts[category.id] = 0;
          }
        })
      );
      setProductCounts(counts);
    } catch (error) {
      toast.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentCategories = filteredCategories.filter((cat) => !cat.parentId);
  const getSubCategories = (parentId: string) =>
    filteredCategories.filter((cat) => cat.parentId === parentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Danh mục sản phẩm
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Khám phá hàng nghìn sản phẩm nội thất chất lượng cao được phân loại
              theo từng danh mục
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Stats & View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              Tất cả danh mục ({filteredCategories.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Chọn danh mục để xem sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy danh mục</h3>
            <p className="text-gray-600 mb-6">
              Thử tìm kiếm với từ khóa khác
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Xóa tìm kiếm
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="space-y-12">
            {parentCategories.map((parent) => {
              const subCategories = getSubCategories(parent.id);
              const allCategories = [parent, ...subCategories];

              return (
                <div key={parent.id} className="space-y-6">
                  {/* Parent Category Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{parent.name}</h3>
                      {parent.description && (
                        <p className="text-gray-600 mt-1">{parent.description}</p>
                      )}
                    </div>
                    <Link
                      href={`/products?category=${parent.id}`}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Xem tất cả
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.id}`}
                        className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Category Image */}
                        <div className="relative h-48 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="w-16 h-16 text-primary-300" />
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Product Count Badge */}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-sm font-semibold text-primary-600">
                              {productCounts[category.id] || 0} sản phẩm
                            </span>
                          </div>
                        </div>

                        {/* Category Info */}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {category.name}
                          </h4>
                          {category.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          
                          {/* View Button */}
                          <div className="mt-3 flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                            <span>Khám phá</span>
                            <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {parentCategories.map((parent) => {
              const subCategories = getSubCategories(parent.id);

              return (
                <div key={parent.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Parent Category */}
                  <Link
                    href={`/products?category=${parent.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition group"
                  >
                    <div className="relative w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg overflow-hidden flex-shrink-0">
                      {parent.image ? (
                        <Image
                          src={parent.image}
                          alt={parent.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-10 h-10 text-primary-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary-600 transition-colors">
                        {parent.name}
                      </h3>
                      {parent.description && (
                        <p className="text-gray-600 line-clamp-2">
                          {parent.description}
                        </p>
                      )}
                      {subCategories.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          {subCategories.length} danh mục con
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="px-4 py-2 bg-primary-100 text-primary-600 rounded-full font-semibold">
                        {productCounts[parent.id] || 0} sản phẩm
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* Sub Categories */}
                  {subCategories.length > 0 && (
                    <div className="border-t bg-gray-50">
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subCategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${sub.id}`}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition group"
                          >
                            <div className="relative w-12 h-12 bg-primary-50 rounded-lg overflow-hidden flex-shrink-0">
                              {sub.image ? (
                                <Image
                                  src={sub.image}
                                  alt={sub.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-primary-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium group-hover:text-primary-600 transition-colors line-clamp-1">
                                {sub.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {productCounts[sub.id] || 0} sản phẩm
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Không tìm thấy danh mục bạn cần?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Liên hệ ngay
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}