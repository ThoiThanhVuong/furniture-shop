'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, Grid, List, Star } from 'lucide-react';
import { productsAPI, categoriesAPI, cartAPI } from '@/services/api';
import { Product, Category, ProductFilters } from '@/types';
import { toast } from 'sonner';
import { useAuthStore, useCartStore } from '@/store/useStore';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // 🔐 auth + cart store
  const { user } = useAuthStore();
  const addToCartLocal = useCartStore((state) => state.addToCart);
  const setItemsFromServer = useCartStore((state) => state.setItemsFromServer);

  const [filters, setFilters] = useState<ProductFilters>({
    categoryId: searchParams.get('category') || undefined,
    minPrice: undefined,
    maxPrice: undefined,
    search: searchParams.get('search') || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Load categories 1 lần
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ filters với URL (?search=, ?category=)
  useEffect(() => {
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    setFilters((prev) => ({
      ...prev,
      search,
      categoryId: category,
      page: 1,
    }));
  }, [searchParams]);

  // Mỗi khi filters thay đổi => load products
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Toast thông báo khi không có kết quả tìm kiếm
  useEffect(() => {
    if (!loading && products.length === 0 && filters.search) {
      toast.info(`Không tìm thấy sản phẩm nào cho "${filters.search}"`);
    }
  }, [loading, products.length, filters.search]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data);
    } catch (error) {
      toast.error('Không thể tải danh mục');
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll(filters);
      const { products, pagination } = res.data.data;

      setProducts(products);
      setPagination({
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
      });
    } catch (error) {
      toast.error('Không thể tải sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // đổi filter khác thì reset về page 1
    }));
  };

  // ⭐ Thêm vào giỏ: guest = local, logged-in = server + sync
  const handleAddToCart = async (product: Product) => {
    // Chưa login → dùng cart local
    if (!user) {
      addToCartLocal(product, 1);
      toast.success('Đã thêm vào giỏ hàng');
      return;
    }

    // Đã login → gọi BE và sync lại store từ server
    try {
      await cartAPI.addItem({ productId: product.id, quantity: 1 });

      const cartRes = await cartAPI.getCart();
      const cart = cartRes.data.data; // { id, userId, items: [...] }

      setItemsFromServer(cart.items || []);

      toast.success('Đã thêm vào giỏ hàng');
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          'Không thể thêm sản phẩm vào giỏ hàng',
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sản phẩm</h1>
          <p className="text-gray-600">
            {filters.search ? (
              <>
                Tìm thấy{' '}
                <span className="font-semibold">{pagination.total}</span> sản
                phẩm cho từ khóa{' '}
                <span className="font-semibold">
                  &quot;{filters.search}&quot;
                </span>
              </>
            ) : (
              <>Tìm thấy {pagination.total} sản phẩm</>
            )}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 flex-shrink-0`}
          >
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Bộ lọc</h2>
                <button
                  onClick={() =>
                    setFilters({
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                      page: 1,
                      limit: 12,
                    } as ProductFilters)
                  }
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Xóa bộ lọc
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Danh mục</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.categoryId}
                      onChange={() =>
                        handleFilterChange('categoryId', undefined)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Tất cả</span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={filters.categoryId === category.id}
                        onChange={() =>
                          handleFilterChange('categoryId', category.id)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Khoảng giá</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Giá tối thiểu"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'minPrice',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Giá tối đa"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'maxPrice',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* On sale */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Khuyến mãi</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filters.onSale}
                    onChange={(e) =>
                      handleFilterChange(
                        'onSale',
                        e.target.checked || undefined,
                      )
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    Chỉ hiển thị sản phẩm đang giảm giá
                  </span>
                </label>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold mb-3">Sắp xếp</h3>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: sortBy as any,
                      sortOrder: sortOrder as any,
                      page: 1,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hiển thị:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 text-primary-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-primary-100 text-primary-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg p-4">
                    <div className="bg-gray-200 h-64 rounded-lg mb-3"></div>
                    <div className="bg-gray-200 h-4 rounded w-full mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center space-y-2">
                {filters.search ? (
                  <>
                    <p className="text-gray-700">
                      Không tìm thấy sản phẩm nào phù hợp với từ khóa{' '}
                      <span className="font-semibold">
                        &quot;{filters.search}&quot;
                      </span>
                      .
                    </p>
                    <p className="text-gray-500 text-sm">
                      Hãy thử dùng từ khóa khác hoặc bỏ bớt bộ lọc.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">
                    Không tìm thấy sản phẩm nào.
                  </p>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group flex flex-col"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative h-64 bg-gray-100">
                        {product.image && (
                          <Image
                            src={
                              product.image.startsWith('/')
                                ? product.image
                                : '/' + product.image
                            }
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                         {/* Badge HẾT HÀNG */}
                        {product.stock === 0 && (
                          <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                            Hết hàng
                          </div>
                        )}
                        {product.salePrice && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            -
                            {Math.round(
                              ((product.price - product.salePrice) /
                                product.price) *
                                100,
                            )}
                            %
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold mb-2 hover:text-primary-600 transition line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">(24)</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            {product.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-primary-600">
                                  {formatPrice(product.salePrice)}
                                </span>
                                <span className="text-sm text-gray-400 line-through ml-2">
                                  {formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-primary-600">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      className={`w-full py-2 rounded-lg transition font-semibold ${
                                product.stock === 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-primary-600 text-white hover:bg-primary-700'
                              }`}
                      >
                         {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition flex"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="w-64 flex-shrink-0"
                    >
                      <div className="relative h-64 bg-gray-100">
                        {product.image && (
                          <Image
                            src={
                              product.image.startsWith('/')
                                ? product.image
                                : '/' + product.image
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-xl font-semibold mb-2 hover:text-primary-600 transition">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.salePrice ? (
                            <>
                              <span className="text-2xl font-bold text-primary-600">
                                {formatPrice(product.salePrice)}
                              </span>
                              <span className="text-lg text-gray-400 line-through ml-2">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-primary-600">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() =>
                    handleFilterChange('page', (filters.page || 1) - 1)
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleFilterChange('page', i + 1)}
                    className={`px-4 py-2 rounded-lg transition ${
                      filters.page === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    handleFilterChange('page', (filters.page || 1) + 1)
                  }
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
