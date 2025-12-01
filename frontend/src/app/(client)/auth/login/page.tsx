'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI, cartAPI } from '@/services/api';
import { useAuthStore,useCartStore } from '@/store/useStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);
  const {
  items: localCartItems,
  setItemsFromServer,
  clearCart: clearLocalCart,
  clearVoucher, 
} = useCartStore();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

const onSubmit = async (data: LoginForm) => {
  setLoading(true);
  try {
    const response = await authAPI.login(data);
    const { user, token } = response.data.data;
    // Chọn loại storage trước khi setAuth
    if (typeof window !== "undefined") {
      if (data.rememberMe) {
        // Lưu lâu dài
        window.sessionStorage.setItem("auth-storage-type", "local");
      } else {
        // Chỉ cho phiên hiện tại
        window.sessionStorage.setItem("auth-storage-type", "session");
        // Đảm bảo không còn auth cũ trong localStorage
        window.localStorage.removeItem("auth-storage");
      }
    }
    setAuth(user, token);

    try {
      // 1. Lấy cart hiện tại trên server
      const serverCartRes = await cartAPI.getCart();
      const serverCart = serverCartRes.data.data;
      const serverItems = serverCart.items || [];

      // 2. Nếu user CHƯA có item trên server
      //    nhưng guest cart đang có -> merge guest lên server
      if (serverItems.length === 0 && localCartItems.length > 0) {
        for (const item of localCartItems) {
          await cartAPI.addItem({
            productId: item.product.id,
            quantity: item.quantity,
          });
        }

        // Sau khi merge, clear cart guest
        clearLocalCart();
        clearVoucher();

        // Lấy lại cart sau khi merge
        const mergedCartRes = await cartAPI.getCart();
        const mergedCart = mergedCartRes.data.data;
        setItemsFromServer(mergedCart.items || []);
      } else {
        // 3. Nếu server đã có cart thì ưu tiên cart server, bỏ guest
        clearLocalCart();
        clearVoucher();
        setItemsFromServer(serverItems);
      }
    } catch (err) {
      console.error("Failed to sync cart", err);
      // Không chặn login nếu sync fail
    }

    toast.success("Đăng nhập thành công");
    if (user.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Đăng nhập thất bại";

    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("rememberMe")} className="w-4 h-4 rounded" />
                <span className="text-sm">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}