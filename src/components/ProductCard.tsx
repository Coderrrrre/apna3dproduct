import React, { useState } from 'react';
import { Bell, Check, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { ColorSwatch, Product } from '../types/shop';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, selectedSwatch?: ColorSwatch) => void;
  onCustomize: (product: Product, selectedSwatch?: ColorSwatch) => void;
  showCustomizablePill?: boolean;
  showSwatches?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onCustomize,
  showCustomizablePill = false,
  showSwatches = true,
}) => {
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatch | undefined>(
    product.swatches?.[0]
  );
  const [notified, setNotified] = useState(false);

  return (
    <article className="rounded-[16px] bg-white border border-[#E5E7EB] overflow-hidden flex flex-col h-full transition-transform duration-200 hover:-translate-y-0.5">
      {/* Studio Product Image Area */}
      <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
        <ResilientImage
          src={product.image}
          alt={product.title}
          fallbackLabel={product.title}
          className={`w-full h-full ${!product.inStock ? 'opacity-80' : ''}`}
        />

        {/* Top-left Sale / % OFF badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {product.onSale && product.inStock && (
            <span className="rounded-full bg-[#C8232C] text-white text-[11px] font-bold px-2.5 py-0.5">
              Sale
            </span>
          )}
          {product.discountPercent && product.inStock && (
            <span className="rounded-full bg-[#0E7C5B] text-white text-[11px] font-bold px-2.5 py-0.5 tabular-nums">
              {product.discountPercent}% OFF
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-full bg-[#111827]/80 text-white text-[11px] font-semibold px-2.5 py-0.5">
              Restocking soon
            </span>
          )}
        </div>

        {/* Bottom-left Customizable Image Pill */}
        {showCustomizablePill && product.customizable && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#1F6E72]">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>Customizable</span>
          </span>
        )}

        {/* Top-right Wishlist Heart (min 44x44px touch target) */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          className="absolute top-1.5 right-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full cursor-pointer group"
        >
          <span className="w-9 h-9 rounded-full bg-white/95 border border-[#E5E7EB] flex items-center justify-center transition-colors group-hover:border-[#C8232C]">
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted
                  ? 'fill-[#C8232C] text-[#C8232C]'
                  : 'text-[#64748B] group-hover:text-[#C8232C]'
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            {product.category}
          </p>
          <h3 className="font-heading text-sm sm:text-[15px] font-semibold text-[#111827] mt-0.5 line-clamp-2 leading-snug">
            {product.title}
          </h3>
          <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
            {product.subtitle}
          </p>

          {/* Interactive Color Swatches */}
          {showSwatches && product.swatches && product.swatches.length > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                <span>Available in:</span>
                <span className="font-medium text-[#111827] truncate">
                  {selectedSwatch?.name}
                </span>
              </div>
              <div className="flex items-center -ml-2 mt-0.5">
                {product.swatches.map((swatch) => {
                  const active = selectedSwatch?.id === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setSelectedSwatch(swatch)}
                      aria-label={`Select ${swatch.name} color for ${product.title}`}
                      aria-pressed={active}
                      className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full cursor-pointer"
                    >
                      <span
                        className={`w-5 h-5 rounded-full transition-transform ${
                          active
                            ? 'ring-2 ring-offset-2 ring-[#1F6E72] scale-105'
                            : 'hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: swatch.hex,
                          border: swatch.ringHex
                            ? `1px solid ${swatch.ringHex}`
                            : '1px solid rgba(17,24,39,0.18)',
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price + Primary Action */}
        <div className="pt-2 border-t border-[#E5E7EB]/70">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-heading text-base sm:text-[17px] font-bold text-[#111827] tabular-nums">
              ₹{product.price.toFixed(2)}
            </span>
            <span className="text-xs text-[#64748B] line-through tabular-nums">
              ₹{product.mrp}
            </span>
          </div>

          {!product.inStock ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="flex-1 min-h-[44px] rounded-[10px] bg-[#9BBEC0] text-white font-semibold text-xs sm:text-sm px-3 py-2.5 cursor-not-allowed whitespace-nowrap"
              >
                Out of stock
              </button>
              <button
                type="button"
                onClick={() => setNotified(true)}
                aria-label={`Notify me when ${product.title} is back in stock`}
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#1F6E72] text-[#111827] transition-colors cursor-pointer px-2.5"
              >
                {notified ? (
                  <Check className="w-4 h-4 text-[#0E7C5B]" aria-hidden="true" />
                ) : (
                  <Bell className="w-4 h-4 text-[#1F6E72]" aria-hidden="true" />
                )}
              </button>
            </div>
          ) : product.customizable ? (
            <button
              type="button"
              onClick={() => onCustomize(product, selectedSwatch)}
              className="w-full min-h-[44px] rounded-[10px] bg-[#1F6E72] hover:bg-[#165356] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Customize now</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product, selectedSwatch)}
              className="w-full min-h-[44px] rounded-[10px] bg-[#1F6E72] hover:bg-[#165356] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>Add to cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
