'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/useStore';

export default function AddressPage() {
  const { user } = useAuthStore();
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile({ address });
      toast.success('Cập nhật địa chỉ thành công');
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-xl bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <MapPin className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold">Sổ địa chỉ</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Địa chỉ giao hàng</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Nhập địa chỉ giao hàng của bạn"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
          </button>
        </form>
      </div>
    </div>
  );
}
