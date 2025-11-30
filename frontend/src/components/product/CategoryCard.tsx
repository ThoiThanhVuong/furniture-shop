import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  productCount?: number;
  variant?: 'default' | 'compact' | 'featured';
}

export default function CategoryCard({ 
  category, 
  productCount = 0,
  variant = 'default' 
}: CategoryCardProps) {
  
  if (variant === 'compact') {
    return (
      <Link
        href={`/products?category=${category.id}`}
        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition group"
      >
        <div className="relative w-12 h-12 bg-primary-50 rounded-lg overflow-hidden flex-shrink-0">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium group-hover:text-primary-600 transition-colors line-clamp-1">
            {category.name}
          </p>
          <p className="text-xs text-gray-500">
            {productCount} sản phẩm
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/products?category=${category.id}`}
        className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
      >
        {/* Background Image with Overlay */}
        <div className="relative h-64 overflow-hidden">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Package className="w-20 h-20 text-primary-400" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
            {category.description && (
              <p className="text-sm opacity-90 line-clamp-2 mb-3">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {productCount} sản phẩm
              </span>
              <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Khám phá</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Category Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-16 h-16 text-primary-300" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Product Count Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-primary-600">
            {productCount} sản phẩm
          </span>
        </div>
      </div>

      {/* Category Info */}
      <div className="p-4">
        <h4 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
          {category.name}
        </h4>
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {category.description}
          </p>
        )}
        
        {/* View Button */}
        <div className="flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
          <span>Khám phá</span>
          <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
        </div>
      </div>
    </Link>
  );
}