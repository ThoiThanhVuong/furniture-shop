'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);

  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.changePassword(formData);
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');

      
      router.push('/account');
    } catch (error: any) {
      toast.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-xl bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <Shield className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showOld ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNew ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Đang thay đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
