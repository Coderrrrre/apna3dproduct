import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CategoryCardItem, ProductCategory } from '../types/shop';
import { ResilientImage } from './ResilientImage';

interface CategoryGridProps {
  categories: CategoryCardItem[];
  onSelectCategory: (category: ProductCategory, targetSectionId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section
      id="shop-categories"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
    >
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            Shop by Category
          </h2>
          <p className="mt-1 text-sm sm:text-base text-[#64748B]">
            Made-to-order 3D prints crafted with crisp layer fidelity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.category, cat.targetSectionId)}
            className="group relative aspect-square rounded-[16px] overflow-hidden border border-[#E5E7EB] bg-[#F8FAFC] text-left cursor-pointer"
          >
            <ResilientImage
              src={cat.image}
              alt={cat.title}
              fallbackLabel={cat.title}
              className="w-full h-full transition-transform duration-300 group-hover:scale-105"
            />

            {/* Measured contrast scrim for 4.5:1 text legibility */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10"
            />

            {/* Top-left Starting at ₹149 teal pill */}
            <span className="absolute top-3 left-3 rounded-full bg-[#1F6E72] text-white text-[11px] sm:text-xs font-semibold px-3 py-1 tabular-nums">
              Starting at ₹{cat.startingPrice}
            </span>

            {/* Bottom category label */}
            <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-heading text-sm sm:text-lg font-bold text-white leading-tight truncate">
                  {cat.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-200 mt-0.5 truncate">
                  {cat.itemCountLabel}
                </p>
              </div>
              <span className="w-8 h-8 rounded-full bg-white/95 text-[#111827] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
