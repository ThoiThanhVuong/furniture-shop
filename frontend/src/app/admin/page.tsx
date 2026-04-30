'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Mail,
} from 'lucide-react';
import { dashboardAPI } from '@/services/api';
import { DashboardStats } from '@/types';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: stats ? formatPrice(stats.totalRevenue) : '0đ',
      icon: DollarSign,
      color: 'bg-blue-500',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Đơn hàng',
      value: stats?.totalOrders ?? '0',
      icon: ShoppingCart,
      color: 'bg-green-500',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Sản phẩm',
      value: stats?.totalProducts.toString() || '0',
      icon: Package,
      color: 'bg-purple-500',
      trend: '+3.1%',
      trendUp: true,
    },
    {
      title: 'Khách hàng',
      value: stats?.totalUsers.toString() || '0',
      icon: Users,
      color: 'bg-orange-500',
      trend: '+5.4%',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-600">Tổng quan và thống kê hệ thống</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trendUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.trend}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Đơn hàng gần đây</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          {stats && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      {formatPrice(order.total)}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      //order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Chưa có đơn hàng nào</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Sản phẩm bán chạy</h3>
            <Link
              href="/admin/products"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          {stats && stats.topProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.topProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      Đã bán: {item.soldCount} sản phẩm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      {formatPrice(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products/create"
            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <Package className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium">Thêm sản phẩm</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <Package className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium">Danh mục</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <ShoppingCart className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium">Quản lý đơn hàng</span>
          </Link>
          <Link
            href="/admin/vouchers"
            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <Package className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium">Voucher</span>
          </Link>
          <Link
            href="/admin/contacts"
            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <Mail className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium">Liên hệ khách hàng</span>
          </Link>

        </div>
      </div>
    </div>
  );
}