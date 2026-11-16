import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowRight,
  Check,
  Copy,
  Heart,
  Layers,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { Product } from '../types/shop';
import { ResilientImage } from './ResilientImage';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeroSectionProps {
  heroProducts: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroProducts,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onCustomize,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const heroRootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-stagger',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );

      gsap.fromTo(
        '.hero-card-stagger',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          delay: 0.14,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    }, heroRootRef);

    return () => ctx.revert();
  }, []);

  const handleCopyPromo = () => {
    navigator.clipboard?.writeText('APNA20').catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="top"
      ref={heroRootRef}
      className="bg-gradient-to-b from-[#EBF5F5] via-[#F5FAFA] to-white border-b border-[#E5E7EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
        {/* Top Hero Editorial Copy & Primary Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
          <div className="lg:col-span-7">
            <div className="hero-stagger inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E7EB] px-3.5 py-1.5 text-xs font-semibold text-[#1F6E72] mb-4">
              <Tag className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Keyrings &amp; Bag Tags</span>
            </div>

            <h1 className="hero-stagger font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111827] leading-[1.12] text-balance max-w-2xl">
              Carry a little colour everywhere
            </h1>

            <p className="hero-stagger mt-4 text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
              Crafting Tomorrow&apos;s Reality — precision 3D printed number plates,
              personalized name tags, and custom workshop prints made to order in India.
            </p>

            <div className="hero-stagger mt-7 flex flex-wrap items-center gap-3.5">
              <Button
                type="button"
                onClick={() => scrollToSection('customized-items')}
                className="px-6"
              >
                <span>Shop Keyrings</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => scrollToSection('print-lab')}
              >
                <Layers className="w-4 h-4 text-[#1F6E72]" aria-hidden="true" />
                <span>Apna 3D Print Lab</span>
              </Button>
            </div>
          </div>

          {/* 20% OFF Promo Banner Card */}
          <div className="hero-stagger lg:col-span-5 flex lg:justify-end">
            <div className="w-full max-w-md rounded-[16px] bg-white border border-[#E5E7EB] p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="discount">20% OFF</Badge>
                  <span className="text-xs font-medium text-[#64748B]">
                    First custom order
                  </span>
                </div>
                <p className="font-heading text-sm sm:text-base font-bold text-[#111827]">
                  Flat 20% off sitewide with code{' '}
                  <span className="font-mono text-[#1F6E72]">APNA20</span>
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Apply at checkout · Free delivery above ₹499
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPromo}
                aria-label="Copy promo code APNA20"
                className="min-h-[44px] bg-[#F8FAFC]"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-[#0E7C5B]" aria-hidden="true" />
                    <span className="text-[#0E7C5B]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#1F6E72]" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Horizontal 4-Card Hero Product Strip */}
        <div
          aria-label="Featured keyrings and bag tags"
          className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible snap-x snap-mandatory no-scrollbar pb-2 lg:pb-0"
        >
          {heroProducts.slice(0, 4).map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            return (
              <article
                key={product.id}
                className="hero-card-stagger min-w-[265px] sm:min-w-[280px] lg:min-w-0 snap-start rounded-[16px] bg-white border border-[#E5E7EB] overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
              >
                {/* Product Image Area */}
                <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
                  <ResilientImage
                    src={product.image}
                    alt={product.title}
                    fallbackLabel={product.title}
                    className="w-full h-full"
                  />

                  {/* Top-left Sale + % OFF pills */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {product.onSale && <Badge variant="sale">Sale</Badge>}
                    {product.discountPercent && (
                      <Badge variant="discount">
                        {product.discountPercent}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Top-right Wishlist Heart (44x44px touch target) */}
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

                {/* Card Content */}
                <div className="p-4 flex items-end justify-between gap-3 flex-1">
                  <div className="min-w-0">
                    <h2 className="font-heading text-sm font-semibold text-[#111827] truncate">
                      {product.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-full bg-[#1F6E72] text-white text-xs font-semibold px-3 py-1 tabular-nums whitespace-nowrap">
                        {product.isStartingPrice
                          ? `From ₹${product.price.toFixed(2)}`
                          : `₹${product.price.toFixed(2)}`}
                      </span>
                      <span className="text-xs text-[#64748B] line-through tabular-nums">
                        ₹{product.mrp}
                      </span>
                    </div>
                  </div>

                  {/* Circular Teal Cart CTA (44x44px hit target) */}
                  <button
                    type="button"
                    onClick={() =>
                      product.customizable ? onCustomize(product) : onAddToCart(product)
                    }
                    aria-label={
                      product.customizable
                        ? `Customize ${product.title}`
                        : `Add ${product.title} to cart`
                    }
                    className="min-w-[44px] min-h-[44px] shrink-0 rounded-full bg-[#1F6E72] hover:bg-[#165356] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
