import React, { useState } from 'react';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../types/shop';
import { ResilientImage } from './ResilientImage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onAddToCart,
  onCustomize,
}) => {
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const matches = trimmed
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.subtitle.toLowerCase().includes(trimmed)
      )
    : products.slice(0, 6);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Search store catalog</DialogTitle>
        <DialogDescription className="sr-only">
          Search across keychains, pooja decor, and custom lithophanes
        </DialogDescription>

        <div className="p-4 pr-16 border-b border-[#E5E7EB] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#1F6E72] shrink-0" aria-hidden="true" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keychains, number plate, Krishna lamp, gym plate..."
            aria-label="Search products"
            className="flex-1 min-h-[44px] text-sm sm:text-base text-[#111827] placeholder:text-[#64748B] focus:outline-none"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#E5E7EB]">
          {matches.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64748B]">
              No prints found for &ldquo;{query}&rdquo;. Try &ldquo;Keychain&rdquo;,
              &ldquo;Diya&rdquo;, or &ldquo;Plate&rdquo;.
            </div>
          ) : (
            matches.map((product) => (
              <div
                key={product.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#F8FAFC]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-[10px] overflow-hidden border border-[#E5E7EB] shrink-0">
                    <ResilientImage
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#64748B]">
                      {product.category}
                    </p>
                    <h3 className="font-heading text-sm font-bold text-[#111827] truncate">
                      {product.title}
                    </h3>
                    <p className="text-xs font-bold text-[#1F6E72] tabular-nums">
                      ₹{product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {!product.inStock ? (
                    <span className="inline-flex min-h-[40px] items-center rounded-[10px] bg-[#9BBEC0] text-white text-xs font-semibold px-3.5">
                      Out of stock
                    </span>
                  ) : product.customizable ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onCustomize(product);
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onAddToCart(product);
                        onClose();
                      }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
