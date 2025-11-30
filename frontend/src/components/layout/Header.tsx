'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // state để biết đã mount chưa
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, logout } = useAuthStore();
  const itemCountStore = useCartStore((state) => state.getItemCount());

  //giá trị dùng để render, lần đầu luôn giống server
  const displayUser = mounted ? user : null;        
  const displayItemCount = mounted ? itemCountStore : 0; 

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchTerm.trim();
    if (!keyword) return;

    router.push(`/products?search=${encodeURIComponent(keyword)}`);
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <p>Miễn phí vận chuyển cho đơn hàng trên 5.000.000đ</p>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:underline">Liên hệ</Link>
            <Link href="/about" className="hover:underline">Về chúng tôi</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            FurniShop
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="hover:text-primary-600 transition">
              Trang chủ
            </Link>
            <Link href="/products" className="hover:text-primary-600 transition">
              Sản phẩm
            </Link>
            <Link href="/categories" className="hover:text-primary-600 transition">
              Danh mục
            </Link>
            <Link href="/about" className="hover:text-primary-600 transition">
              Về chúng tôi
            </Link>
            <Link href="/contact" className="hover:text-primary-600 transition">
              Liên hệ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {displayItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {displayItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {displayUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">
                    {displayUser.name}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/account"
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                  >
                    Tài khoản
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                  >
                    Đơn hàng
                  </Link>
                  {displayUser.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-gray-100 transition"
                    >
                      Quản trị
                    </Link>
                  )}
                  <hr className="my-2" />
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <User className="w-4 h-4" />
                Đăng nhập
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="mt-4 animate-slide-up">
            <form className="flex gap-2" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Tìm
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t animate-slide-up">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="py-2 hover:text-primary-600 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="py-2 hover:text-primary-600 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            <Link
              href="/categories"
              className="py-2 hover:text-primary-600 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Danh mục
            </Link>
            <Link
              href="/about"
              className="py-2 hover:text-primary-600 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Về chúng tôi
            </Link>
            <Link
              href="/contact"
              className="py-2 hover:text-primary-600 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Liên hệ
            </Link>
            {!displayUser && (
              <Link
                href="/auth/login"
                className="py-2 text-primary-600 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
