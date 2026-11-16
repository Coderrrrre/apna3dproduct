import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ColorSwatch, Product } from '../types/shop';
import { ProductCard } from './ProductCard';

interface CarouselSectionProps {
  id: string;
  title: string;
  subtitle: string;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, selectedSwatch?: ColorSwatch) => void;
  onCustomize: (product: Product, selectedSwatch?: ColorSwatch) => void;
  surfaceClassName?: string;
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({
  id,
  title,
  subtitle,
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onCustomize,
  surfaceClassName = 'bg-white',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 'prev' | 'next') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = Math.max(280, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  return (
    <section id={id} className={`${surfaceClassName} border-t border-[#E5E7EB]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              {title}
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#64748B]">{subtitle}</p>
          </div>

          {/* (<) (>) Accessible 44x44px Carousel Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollByAmount('prev')}
              aria-label={`Previous ${title}`}
              className="min-w-[44px] min-h-[44px] rounded-full border border-[#E5E7EB] bg-white hover:border-[#1F6E72] hover:text-[#1F6E72] text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount('next')}
              aria-label={`Next ${title}`}
              className="min-w-[44px] min-h-[44px] rounded-full border border-[#E5E7EB] bg-white hover:border-[#1F6E72] hover:text-[#1F6E72] text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[290px] lg:w-[295px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onCustomize={onCustomize}
                showCustomizablePill={Boolean(product.customizable)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
