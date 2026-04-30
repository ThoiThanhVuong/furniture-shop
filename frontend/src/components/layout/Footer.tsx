import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">FurniShop</h3>
            <p className="mb-4 text-sm">
              Chuyên cung cấp đồ nội thất cao cấp, hiện đại cho ngôi nhà của bạn.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-400 transition">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary-400 transition">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary-400 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping-policy" className="hover:text-primary-400 transition">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-primary-400 transition">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary-400 transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Đường ABC, Quận 1, TP.HCM, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+84123456789" className="hover:text-primary-400 transition">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@furnishop.com" className="hover:text-primary-400 transition">
                  info@furnishop.com
                </a>
              </li>
            </ul>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 FurniShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}