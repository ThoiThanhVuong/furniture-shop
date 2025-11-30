"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Wallet, CheckCircle2 } from "lucide-react";
import { useCartStore, useAuthStore } from "@/store/useStore";
import { ordersAPI, shopAPI, vouchersAPI } from "@/services/api";
import { toast } from "sonner";
import { PaymentMethod, Voucher } from "@/types";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    getSelectedItems,
    getSelectedTotal,
    removeSelectedItems,
    voucherCode,
    voucherDiscount,
    clearVoucher,
    setVoucher,
  } = useCartStore();

  const { user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");
  const [loading, setLoading] = useState(false);

  // Shop address
  const [shopAddress, setShopAddress] = useState<string | null>(null);

  // Voucher dropdown state
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const watchAddress = watch("address") || "";

  // Normalize address
  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();

  const isPickupAtShop =
    shopAddress &&
    normalize(watchAddress) === normalize(shopAddress);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    if (user) {
      setValue("fullName", user.name);
      setValue("email", user.email);
      setValue("phone", user.phone || "");
      setValue("address", user.address || "");
    }

    const fetchShopInfo = async () => {
      try {
        const res = await shopAPI.getInfo();
        if (res.data.data?.address) {
          setShopAddress(res.data.data.address);
        }
      } catch (err) {
        console.error("Không lấy được địa chỉ shop", err);
      }
    };

    const fetchVouchers = async () => {
      try {
        const res = await vouchersAPI.getAvailable();
        const list = res.data.data || [];
        const now = new Date();

        // lọc lại client-side cho chắc
        const validList = list.filter((v) => {
          const start = new Date(v.startDate);
          const end = new Date(v.endDate);
          const inDateRange = start <= now && end >= now;
          const underLimit =
            !v.usageLimit || v.usedCount < v.usageLimit;
          return v.isActive && inDateRange && underLimit;
        });

        setAvailableVouchers(validList);

        // Nếu từ Cart đã có voucherCode thì chọn sẵn trong dropdown
        if (voucherCode) {
          setSelectedVoucherCode(voucherCode);
        }
      } catch (err) {
        console.error("Không lấy được danh sách voucher", err);
      }
    };

    fetchShopInfo();
    fetchVouchers();
  }, [items, user, router, setValue, voucherCode]);

  // -------------------------
  // TÍNH TIỀN
  // -------------------------
  const selectedItems = getSelectedItems();
  const subtotal = getSelectedTotal();

  const FREE_SHIP_THRESHOLD = 1_000_000;
  const SHIPPING_FEE = 30_000;

  const shippingFee = isPickupAtShop
    ? 0
    : subtotal >= FREE_SHIP_THRESHOLD
    ? 0
    : SHIPPING_FEE;

  const total =
    Math.max(0, subtotal - (voucherDiscount || 0)) + shippingFee;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // -------------------------
  // ÁP DỤNG VOUCHER (dropdown)
  // -------------------------
  const handleApplyVoucher = async () => {
    if (!selectedVoucherCode) {
      toast.error("Vui lòng chọn mã giảm giá");
      return;
    }

    if (subtotal === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }

    try {
      setVoucherLoading(true);

      const res = await vouchersAPI.validate(
        selectedVoucherCode,
        subtotal
      );

      const { voucher, discount } = res.data.data;

      setVoucher(voucher.code, discount);

      toast.success(res.data.message || "Áp dụng voucher thành công");
    } catch (err: any) {
      console.error(err);
      clearVoucher();
      toast.error(
        err?.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc không áp dụng được"
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const onSubmit = async (data: CheckoutForm) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      router.push("/auth/login");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: selectedItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      paymentMethod,
      shippingAddress: data.address,
      customerName: data.fullName,
      customerEmail: data.email,
      customerPhone: data.phone,
      notes: data.notes,
      voucherCode: voucherCode || undefined,
      selectedProductIds: selectedItems.map((i) => i.product.id),
    };

      const response = await ordersAPI.create(payload);
      const { order: createdOrder, momo } = response.data.data;

      clearVoucher();
      removeSelectedItems();

      toast.success("Đặt hàng thành công!");

      if (paymentMethod === "COD") {
        router.push(`/account/orders/${createdOrder.id}`);
      } else {
        if (momo?.payUrl) {
          window.location.href = momo.payUrl;
        } else {
          toast.error("Không tạo được link MoMo");
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------

  if (!user || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* full name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      {...register("fullName")}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0123456789"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Địa chỉ giao hàng *
                    </label>
                    <input
                      type="text"
                      {...register("address")}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    />

                    {isPickupAtShop && (
                      <p className="text-green-600 text-sm mt-1">
                        ✔ Địa chỉ trùng với cửa hàng — hệ thống sẽ coi đây là
                        <strong> đơn nhận tại shop</strong>.
                      </p>
                    )}

                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Ghi chú về đơn hàng..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="w-5 h-5"
                    />
                    <Wallet className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-semibold">Thanh toán khi nhận hàng</p>
                      <p className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt
                      </p>
                    </div>
                  </label>

                  {/* MOMO */}
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500">
                    <input
                      type="radio"
                      name="payment"
                      value="MOMO"
                      checked={paymentMethod === "MOMO"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="w-5 h-5"
                    />
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-semibold">Thanh toán MoMo</p>
                      <p className="text-sm text-gray-600">
                        Chuyển khoản qua ví MoMo
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={
                            item.product.image.startsWith("/")
                              ? item.product.image
                              : "/" + item.product.image
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          x{item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Voucher dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={selectedVoucherCode}
                      onChange={(e) =>
                        setSelectedVoucherCode(e.target.value)
                      }
                    >
                      <option value="">Chọn mã giảm giá</option>
                      {availableVouchers.map((v) => (
                        <option key={v.id} value={v.code}>
                          {v.code}{" "}
                          {v.discountType === "PERCENTAGE"
                            ? `- ${v.discountValue}%${
                                v.maxDiscount
                                  ? ` (tối đa ${formatPrice(
                                      v.maxDiscount
                                    )})`
                                  : ""
                              }`
                            : `- ${formatPrice(v.discountValue)}`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !selectedVoucherCode}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-60"
                    >
                      {voucherLoading ? "Đang áp dụng..." : "Áp dụng"}
                    </button>
                  </div>

                  {voucherCode && (
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-green-600">
                        Đã áp dụng mã <strong>{voucherCode}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          clearVoucher();
                          setSelectedVoucherCode("");
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Giảm giá {voucherCode ? `(${voucherCode})` : ""}
                      </span>
                      <span className="font-semibold text-red-600">
                        -{formatPrice(voucherDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        isPickupAtShop ? (
                          <span className="text-green-600">
                            Nhận tại cửa hàng
                          </span>
                        ) : (
                          "Miễn phí"
                        )
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="font-bold text-primary-600 text-xl">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Đặt hàng
                    </>
                  )}
                </button>

                <div className="mt-4 text-center text-sm text-gray-600">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <a
                    href="/terms"
                    className="text-primary-600 hover:underline"
                  >
                    Điều khoản sử dụng
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
