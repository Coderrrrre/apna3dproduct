import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenAffiliate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onOpenSearch,
  onOpenWishlist,
  onOpenCart,
  onOpenAffiliate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartBadgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (cartCount <= 0 || !cartBadgeRef.current) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cartBadgeRef.current,
        { scale: 0.7 },
        { scale: 1, duration: 0.28, ease: 'back.out(2)' }
      );
    });
    return () => ctx.revert();
  }, [cartCount]);

  const navItems = [
    { label: 'Keychains', href: '#customized-items' },
    { label: 'Best Sellers', href: '#best-sellers' },
    { label: 'Pooja & Decor', href: '#pooja-decor' },
    { label: 'Print Lab', href: '#print-lab' },
    { label: 'Track Order', href: '#track-order' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* 1. Top Affiliate Announcement Bar (#0B1727) */}
      <div className="bg-[#0B1727] text-white text-xs sm:text-[13px] h-9 px-4 flex items-center justify-center gap-3">
        <span className="font-normal text-slate-200 truncate">
          Earn 5% on every order you refer
        </span>
        <button
          type="button"
          onClick={onOpenAffiliate}
          className="inline-flex items-center gap-1 font-semibold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 rounded focus-visible:outline-white cursor-pointer"
        >
          <span>Become an affiliate</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* 2. Sticky White Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Isometric 3D Cube Logo + Brand Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group rounded-lg py-1 pr-1"
            aria-label="Apna3DShop.in home"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0 transition-transform duration-200 group-hover:scale-105"
            >
              <path
                d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z"
                fill="#EBF5F5"
                stroke="#1F6E72"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M18 3L31 10.5L18 18L5 10.5L18 3Z" fill="#1F6E72" />
              <path
                d="M18 18V33L31 25.5V10.5L18 18Z"
                fill="#165356"
                fillOpacity="0.88"
              />
              <path
                d="M18 18V33L5 25.5V10.5L18 18Z"
                fill="#9BBEC0"
                fillOpacity="0.65"
              />
            </svg>
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#111827]">
              Apna3DShop<span className="text-[#1F6E72]">.in</span>
            </span>
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-[#64748B]"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="hover:text-[#111827] hover:underline underline-offset-8 decoration-[#1F6E72] decoration-2 transition-colors whitespace-nowrap shrink-0 py-2"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Interactive Header Icon Controls (44x44px hit targets) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search products"
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[#111827] hover:bg-[#F8FAFC] hover:text-[#1F6E72] transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`Open wishlist (${wishlistCount} saved items)`}
              className="relative min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[#111827] hover:bg-[#F8FAFC] hover:text-[#1F6E72] transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C8232C] text-white text-[11px] font-semibold flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open shopping cart (${cartCount} items)`}
              className="relative min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[#111827] hover:bg-[#F8FAFC] hover:text-[#1F6E72] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  ref={cartBadgeRef}
                  className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1F6E72] text-white text-[11px] font-semibold flex items-center justify-center tabular-nums"
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[#111827] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="min-h-[44px] px-3 flex items-center justify-between rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] hover:text-[#1F6E72]"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
