import React, { useEffect } from 'react';
import { Heart, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import { Product } from '../types/shop';
import { ResilientImage } from './ResilientImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  products,
  onClose,
  onRemove,
  onAddToCart,
  onCustomize,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved wishlist items"
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white h-full flex flex-col border-l border-[#E5E7EB] shadow-2xl">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-[#111827]">
            Saved Wishlist ({products.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist drawer"
            className="min-w-[44px] min-h-[44px] rounded-full hover:bg-[#F8FAFC] flex items-center justify-center text-[#111827] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EBF5F5] text-[#1F6E72] flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#111827]">
              No saved items yet
            </h3>
            <p className="text-sm text-[#64748B] mt-1 max-w-xs">
              Tap the heart icon on any 3D printed keychain or decor lamp to save it
              here.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB] px-5">
            {products.map((product) => (
              <div key={product.id} className="py-4 flex gap-3.5 items-center">
                <div className="w-20 h-20 rounded-[12px] overflow-hidden border border-[#E5E7EB] bg-[#F8FAFC] shrink-0">
                  <ResilientImage
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-bold text-[#111827] truncate">
                    {product.title}
                  </h3>
                  <p className="text-xs font-bold text-[#1F6E72] mt-0.5 tabular-nums">
                    ₹{product.price.toFixed(2)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {!product.inStock ? (
                      <span className="text-xs font-semibold text-[#64748B]">
                        Out of stock
                      </span>
                    ) : product.customizable ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onCustomize(product);
                        }}
                        className="min-h-[36px] rounded-[8px] bg-[#1F6E72] hover:bg-[#165356] text-white text-xs font-semibold px-3 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Customize</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        className="min-h-[36px] rounded-[8px] bg-[#1F6E72] hover:bg-[#165356] text-white text-xs font-semibold px-3 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to cart</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemove(product.id)}
                      aria-label={`Remove ${product.title} from wishlist`}
                      className="min-w-[36px] min-h-[36px] rounded-[8px] border border-[#E5E7EB] hover:border-[#C8232C] text-[#64748B] hover:text-[#C8232C] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
