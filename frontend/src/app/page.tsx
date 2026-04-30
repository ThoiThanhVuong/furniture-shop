'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, Truck, Shield, Headphones, RefreshCw } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/services/api';
import { Product, Category } from '@/types';
import { toast } from 'sonner';
import { useCartStore } from '@/store/useStore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]); // 🆕
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, saleRes, categoriesRes] = await Promise.all([
        productsAPI.getFeatured(8),
        productsAPI.getSale(8),        // 🆕 lấy sản phẩm sale
        categoriesAPI.getAll(),
      ]);
      setFeaturedProducts(productsRes.data.data);
      setSaleProducts(saleRes.data.data);
      setCategories(categoriesRes.data.data.slice(0, 6));
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Banner */}
      <section className="relative h-[600px] bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Nội Thất Đẳng Cấp
            </h1>
            <p className="text-xl mb-8 animate-fade-in">
              Khám phá bộ sưu tập nội thất cao cấp, hiện đại cho ngôi nhà của bạn
            </p>
            <div className="flex gap-4 animate-fade-in">
              <Link
                href="/products"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Mua ngay
              </Link>
              <Link
                href="/categories"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
              >
                Khám phá
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Truck className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Miễn phí vận chuyển</h3>
                <p className="text-sm text-gray-600">Đơn hàng trên 1 triệu</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bảo hành chính hãng</h3>
                <p className="text-sm text-gray-600">Lên đến 5 năm</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Headphones className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Hỗ trợ 24/7</h3>
                <p className="text-sm text-gray-600">Tư vấn nhiệt tình</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Đổi trả dễ dàng</h3>
                <p className="text-sm text-gray-600">Trong vòng 30 ngày</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Danh mục sản phẩm</h2>
            <Link
              href="/categories"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group"
                >
                  <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {category.image && (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-center group-hover:text-primary-600 transition">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sản phẩm đang sale */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Sản phẩm đang giảm giá</h2>
            <Link
              href="/products"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-full mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group flex flex-col"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-64 bg-gray-100">
                      {product.image && (
                        <Image
                          src={product.image.startsWith('/') ? product.image : '/' + product.image}
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
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        </div>
                      )}
                    </div>
                  </Link>
                 
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold mb-2 hover:text-primary-600 transition">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
            <Link
              href="/products"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-full mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group flex flex-col" // 🆕 flex-col
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-64 bg-gray-100">
                      {product.image && (
                        <Image
                          src={product.image.startsWith('/') ? product.image : '/' + product.image}
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
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        </div>
                      )}
                    </div>
                  </Link>
                
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold mb-2 hover:text-primary-600 transition">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
