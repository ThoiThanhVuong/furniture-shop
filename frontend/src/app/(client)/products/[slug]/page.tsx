'use client';

import { useEffect, useState } from 'react';
import { useParams ,useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Truck,
  Shield,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { productsAPI, cartAPI } from '@/services/api';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useAuthStore, useCartStore } from '@/store/useStore';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    'description' | 'specifications' | 'reviews'
  >('description');

  //  auth + cart store
  const { user } = useAuthStore();
  const addToCartLocal = useCartStore((state) => state.addToCart);
  const setItemsFromServer = useCartStore((state) => state.setItemsFromServer);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getBySlug(slug);
      const productData = res.data.data;
      setProduct(productData);

      // Load related products
      const relatedRes = await productsAPI.getRelated(productData.id, 4);
      setRelatedProducts(relatedRes.data.data);
    } catch (error) {
      toast.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Thêm vào giỏ: guest = local, logged-in = server + sync
  const handleAddToCart = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    // Clamp quantity cho chắc
    const safeQuantity = Math.min(Math.max(1, quantity), product.stock);

    // Chưa login → cart local
    if (!user) {
      addToCartLocal(product, safeQuantity);
      toast.success(`Đã thêm ${safeQuantity} sản phẩm vào giỏ hàng`);
      return;
    }

    // Đã login → gọi BE + sync lại store
    try {
      await cartAPI.addItem({
        productId: product.id,
        quantity: safeQuantity,
      });

      const cartRes = await cartAPI.getCart();
      const cart = cartRes.data.data; // { id, userId, items: [...] }

      setItemsFromServer(cart.items || []);

      toast.success(`Đã thêm ${safeQuantity} sản phẩm vào giỏ hàng`);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          'Không thể thêm sản phẩm vào giỏ hàng',
      );
    }
  };
  //  MUA NGAY: thêm vào gỏ + nhảy thẳng tới /checkout
  const handleBuyNow = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    const safeQuantity = Math.min(Math.max(1, quantity), product.stock);

    // Chưa login → dùng cart local + sang checkout (checkout sẽ ép login)
    if (!user) {
      addToCartLocal(product, safeQuantity);
      toast.success('Đã thêm sản phẩm, chuyển tới trang thanh toán');
      router.push('/checkout');
      return;
    }

    try {
      // Đã login → thêm vào cart ở BE
      await cartAPI.addItem({
        productId: product.id,
        quantity: safeQuantity,
      });

      // Sync lại giỏ, phòng khi cart dùng selectedItems để checkout
      const cartRes = await cartAPI.getCart();
      const cart = cartRes.data.data;
      setItemsFromServer(cart.items || []);

      toast.success('Chuyển tới trang thanh toán');
      router.push('/checkout');
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          'Không thể thực hiện mua ngay. Vui lòng thử lại.',
      );
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-96 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="bg-gray-200 h-8 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              <div className="bg-gray-200 h-12 rounded w-1/3"></div>
              <div className="bg-gray-200 h-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
          <Link href="/products" className="text-primary-600 hover:underline">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.salePrice
    ? Math.round(
        ((product.price - product.salePrice) / product.price) * 100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary-600">
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="relative bg-white rounded-lg overflow-hidden mb-4 aspect-square">
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
                  priority
                />
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                  -{discount}%
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-gray-600">(128 đánh giá)</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                Đã bán: {product.soldCount ?? 0}
              </span>
            </div>

            <div className="mb-6 pb-6 border-b">
              <div className="flex items-baseline gap-3">
                {product.salePrice ? (
                  <>
                    <span className="text-4xl font-bold text-primary-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">Danh mục:</span>
                <Link
                  href={`/products?category=${product.categoryId}`}
                  className="text-primary-600 hover:underline"
                >
                  {product.category?.name}
                </Link>
              </div>
              {product.material && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-32">Chất liệu:</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-32">Màu sắc:</span>
                  <span className="font-medium">{product.color}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-32">Kích thước:</span>
                  <span className="font-medium">
                    {product.dimensions.width} x {product.dimensions.height} x{' '}
                    {product.dimensions.depth} cm
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">Tình trạng:</span>
                <span
                  className={`font-medium ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0
                    ? `Còn ${product.stock} sản phẩm`
                    : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="px-4 py-2 hover:bg-gray-50 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(
                            product.stock,
                            parseInt(e.target.value) || 1,
                          ),
                        ),
                      )
                    }
                    className="w-20 text-center border-x border-gray-300 py-2 focus:outline-none"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(product.stock, q + 1),
                      )
                    }
                    className="px-4 py-2 hover:bg-gray-50 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                 <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                 <ShoppingCart className="w-5 h-5" />
                Mua ngay
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    Miễn phí vận chuyển
                  </p>
                  <p className="text-xs text-gray-600">
                    Đơn hàng trên 5 triệu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Bảo hành 5 năm</p>
                  <p className="text-xs text-gray-600">
                    Chính hãng 100%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg p-6 mb-12">
          <div className="flex gap-6 border-b mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 px-2 font-semibold transition ${
                activeTab === 'description'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`pb-3 px-2 font-semibold transition ${
                activeTab === 'specifications'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-2 font-semibold transition ${
                activeTab === 'reviews'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đánh giá (128)
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex py-3 border-b">
                <span className="text-gray-600 w-40">SKU</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              {product.material && (
                <div className="flex py-3 border-b">
                  <span className="text-gray-600 w-40">Chất liệu</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {product.color && (
                <div className="flex py-3 border-b">
                  <span className="text-gray-600 w-40">Màu sắc</span>
                  <span className="font-medium">{product.color}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex py-3 border-b">
                  <span className="text-gray-600 w-40">Kích thước</span>
                  <span className="font-medium">
                    {product.dimensions.width} x {product.dimensions.height} x{' '}
                    {product.dimensions.depth} cm
                  </span>
                </div>
              )}
              {product.weight && (
                <div className="flex py-3 border-b">
                  <span className="text-gray-600 w-40">Trọng lượng</span>
                  <span className="font-medium">{product.weight} kg</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Chức năng đánh giá đang được phát triển...
              </p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group"
                >
                  <div className="relative h-64 bg-gray-100">
                    {item.image && (
                      <Image
                        src={
                          item.image.startsWith('/')
                            ? item.image
                            : '/' + item.image
                        }
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="text-lg font-bold text-primary-600">
                      {formatPrice(item.salePrice || item.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
