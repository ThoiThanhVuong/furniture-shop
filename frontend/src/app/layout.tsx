import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import Providers from './providers';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'FurniShop - Nội thất cao cấp',
  description: 'Chuyên cung cấp đồ nội thất cao cấp, hiện đại cho ngôi nhà của bạn',
  keywords: 'nội thất, đồ gỗ, bàn ghế, tủ, giường, sofa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
         
          {children}
          
          <Toaster duration={2000} position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}