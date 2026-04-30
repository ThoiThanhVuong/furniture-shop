'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store/useStore';
import { toast } from 'sonner';
import { vouchersAPI, cartAPI } from '@/services/api';
import type { CartItem, Voucher } from '@/types';

export default function CartPage() {
  const { user } = useAuthStore();

  const {
    items,
    updateQuantity,
    removeFromCart,
    getSelectedTotal,
    toggleSelect,
    toggleSelectAll,
    setItemsFromServer,
    // voucher từ store
    voucherCode,
    voucherDiscount,
    setVoucher,
    clearVoucher,
  } = useCartStore();

  // danh sách voucher & voucher đang chọn
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Đồng bộ cart từ server sau mỗi thao tác (khi đã login)
  const syncCartFromServer = async () => {
    try {
      const cartRes = await cartAPI.getCart();
      const cart = cartRes.data.data; // { id, userId, items: [...] }
      setItemsFromServer(cart.items || []);
    } catch (err) {
      console.error('Failed to sync cart from server', err);
      toast.error('Không thể đồng bộ giỏ hàng');
    }
  };

  // Fetch danh sách voucher khả dụng cho user
  useEffect(() => {
    const fetchAvailableVouchers = async () => {
      // Chưa đăng nhập thì không gọi được API voucher
      if (!user) {
        setAvailableVouchers([]);
        setSelectedVoucherCode('');
        return;
      }

      try {
        const res = await vouchersAPI.getAvailable();
        const list = res.data.data || [];
        const now = new Date();

        const validList = list.filter((v) => {
          const start = new Date(v.startDate);
          const end = new Date(v.endDate);
          const inDateRange = start <= now && end >= now;
          const underLimit =
            !v.usageLimit || v.usedCount < v.usageLimit;
          return v.isActive && inDateRange && underLimit;
        });

        setAvailableVouchers(validList);

        // Nếu đã áp voucher từ trước (store) thì set sẵn vào dropdown
        if (voucherCode) {
          setSelectedVoucherCode(voucherCode);
        }
      } catch (err) {
        console.error('Không lấy được danh sách voucher', err);
      }
    };

    fetchAvailableVouchers();
  }, [user, voucherCode]);

  const handleQuantityChange = async (
    item: CartItem,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const stock = item.product.stock;

    if (newQuantity > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm trong kho`);
      // ép về max stock (local)
      updateQuantity(item.product.id, stock);
      // nếu đã login thì sync với server về max stock luôn
      if (user) {
        try {
          await cartAPI.updateItem(item.id, stock);
          await syncCartFromServer();
        } catch (err: any) {
          console.error(err);
          toast.error(
            err?.response?.data?.message ||
              'Không thể cập nhật số lượng trên server'
          );
        }
      }
      return;
    }

    // Chưa login → chỉ thao tác local
    if (!user) {
      updateQuantity(item.product.id, newQuantity);
      return;
    }

    // Đã login → gọi API + sync
    try {
      await cartAPI.updateItem(item.id, newQuantity);
      await syncCartFromServer();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          'Không thể cập nhật số lượng trên server'
      );
    }
  };

  const handleRemove = async (item: CartItem) => {
    // guest → xóa local
    if (!user) {
      removeFromCart(item.product.id);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      return;
    }

    // logged-in → xóa trên server + sync
    try {
      await cartAPI.removeItem(item.id);
      await syncCartFromServer();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          'Không thể xóa sản phẩm khỏi giỏ hàng'
      );
    }
  };

  //  tính tổng cho sản phẩm được chọn
  const subtotal = getSelectedTotal();

  // free ship từ 1,000,000 và phí 30,000
  const FREE_SHIP_THRESHOLD = 1_000_000;
  const SHIPPING_FEE = 30_000;

  // tổng tiền trước khi trừ voucher (dùng để validate)
  const orderTotalBeforeDiscount = subtotal;

  const shippingFee =
    orderTotalBeforeDiscount >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;

  // tổng sau khi trừ voucher (không âm)
  const total =
    Math.max(0, orderTotalBeforeDiscount - (voucherDiscount || 0)) +
    shippingFee;

  const allSelected =
    items.length > 0 && items.every((item) => item.selected !== false);

  // Áp dụng voucher (dropdown)
  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vui lòng đăng nhập để áp dụng mã giảm giá');
      return;
    }

    if (!selectedVoucherCode) {
      toast.error('Vui lòng chọn mã giảm giá');
      return;
    }

    if (subtotal === 0) {
      toast.error('Vui lòng chọn sản phẩm trong giỏ trước khi áp dụng mã');
      return;
    }

    try {
      setVoucherLoading(true);

      const res = await vouchersAPI.validate(
        selectedVoucherCode,
        orderTotalBeforeDiscount
      );

      // BE trả về: { voucher, discount, finalTotal }
      const { voucher, discount } = res.data.data;

      // lưu vào store
      setVoucher(voucher.code, discount);

      toast.success(res.data.message || 'Áp dụng voucher thành công');
    } catch (err: any) {
      console.error(err);
      clearVoucher();
      toast.error(
        err?.response?.data?.message ||
          'Mã giảm giá không hợp lệ hoặc không áp dụng được'
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b font-semibold grid grid-cols-12 gap-4">
                <div className="col-span-6 flex items-center gap-2">
                  {/* Chọn tất cả */}
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={allSelected}
                    onChange={() => toggleSelectAll()}
                  />
                  <span>Sản phẩm</span>
                </div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Tổng</div>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-6 flex gap-4 items-center">
                      {/* Checkbox từng sản phẩm */}
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={item.selected !== false}
                        onChange={() => toggleSelect(item.product.id)}
                      />
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative w-24 h-24 flex-shrink-0"
                      >
                        {item.product.image && (
                          <Image
                            src={
                              item.product.image.startsWith('/')
                                ? item.product.image
                                : '/' + item.product.image
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        )}
                      </Link>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-semibold hover:text-primary-600 transition line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.color && (
                          <p className="text-sm text-gray-600 mt-1">
                            Màu: {item.product.color}
                          </p>
                        )}
                        <button
                          onClick={() => handleRemove(item)}
                          className="text-red-600 text-sm mt-2 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-center">
                      <p className="font-semibold">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-16 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          min="1"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= item.product.stock}
                          className={`w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center transition
                                    ${
                                      item.quantity >= item.product.stock
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-50'
                                    }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <p className="font-bold text-primary-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Link
                href="/products"
                className="text-primary-600 hover:text-primary-700 transition"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

              {/* Voucher (dropdown giống Checkout) */}
              <form onSubmit={handleApplyVoucher} className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedVoucherCode}
                    onChange={(e) =>
                      setSelectedVoucherCode(e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Chọn mã giảm giá</option>
                    {availableVouchers.map((v) => (
                      <option key={v.id} value={v.code}>
                        {v.code}{' '}
                        {v.discountType === 'PERCENTAGE'
                          ? `- ${v.discountValue}%${
                              v.maxDiscount
                                ? ` (tối đa ${formatPrice(
                                    v.maxDiscount
                                  )})`
                                : ''
                            }`
                          : `- ${formatPrice(v.discountValue)}`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={voucherLoading || !selectedVoucherCode}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-60"
                  >
                    {voucherLoading ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                </div>
                {voucherCode && (
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <p className="text-green-600">
                      Đã áp dụng mã <strong>{voucherCode}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        clearVoucher();
                        setSelectedVoucherCode('');
                      }}
                      className="text-red-500 hover:underline"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </form>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tạm tính (sản phẩm chọn)
                  </span>
                  <span className="font-semibold">
                    {formatPrice(orderTotalBeforeDiscount)}
                  </span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Giảm giá {voucherCode ? `(${voucherCode})` : ''}
                    </span>
                    <span className="font-semibold text-red-600">
                      -{formatPrice(voucherDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold">
                    {shippingFee === 0
                      ? 'Miễn phí'
                      : formatPrice(shippingFee)}
                  </span>
                </div>

                {shippingFee > 0 &&
                  orderTotalBeforeDiscount < FREE_SHIP_THRESHOLD && (
                    <p className="text-sm text-gray-500">
                      Mua thêm{' '}
                      {formatPrice(
                        FREE_SHIP_THRESHOLD - orderTotalBeforeDiscount
                      )}{' '}
                      để được miễn phí vận chuyển
                    </p>
                  )}

                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="font-bold text-primary-600 text-xl">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full mt-6 py-3 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Tiến hành thanh toán
              </Link>

              <div className="mt-4 text-center text-sm text-gray-500">
                Hoặc{' '}
                <Link
                  href="/products"
                  className="text-primary-600 hover:underline"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
