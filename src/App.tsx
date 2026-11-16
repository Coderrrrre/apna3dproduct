/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, PRODUCTS } from './data/catalog';
import { createAndSaveOrderRecord, loadSavedOrders } from './data/orders';
import {
  CartItem,
  ColorSwatch,
  CustomConfig,
  OrderConfirmation,
  OrderTrackingRecord,
  Product,
  ProductCategory,
} from './types/shop';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { CarouselSection } from './components/CarouselSection';
import { ProductCard } from './components/ProductCard';
import { TrustDeliverySection } from './components/TrustDeliverySection';
import { PrintLabSection } from './components/PrintLabSection';
import { OrderTrackingSection } from './components/OrderTrackingSection';
import { CustomizerModal } from './components/CustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { AffiliateModal } from './components/AffiliateModal';
import { WhatsAppWidget, WHATSAPP_DISPLAY, WHATSAPP_DIGITS } from './components/WhatsAppWidget';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<OrderTrackingRecord[]>(() =>
    loadSavedOrders()
  );
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>(
    'APNA-4821'
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);

  const [customizerTarget, setCustomizerTarget] = useState<{
    product: Product;
    swatch?: ColorSwatch;
  } | null>(null);

  const [customFilter, setCustomFilter] = useState<
    'all' | 'plates' | 'gym-fitness' | 'names-tags'
  >('all');

  const mainRef = useRef<HTMLElement>(null);

  // Light GSAP ScrollTrigger section reveals
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced || !mainRef.current) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('.gsap-reveal-section');
      sections.forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: sec,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const heroProducts = useMemo(
    () => PRODUCTS.filter((p) => p.sections.includes('hero')),
    []
  );
  const bestSellerProducts = useMemo(
    () => PRODUCTS.filter((p) => p.sections.includes('bestsellers')),
    []
  );
  const customizedProducts = useMemo(() => {
    const list = PRODUCTS.filter((p) => p.sections.includes('customized'));
    if (customFilter === 'plates') {
      return list.filter((p) => p.customizerMode === 'plate');
    }
    if (customFilter === 'gym-fitness') {
      return list.filter((p) => p.customizerMode === 'gym');
    }
    if (customFilter === 'names-tags') {
      return list.filter((p) => p.customizerMode === 'name');
    }
    return list;
  }, [customFilter]);

  const poojaProducts = useMemo(
    () => PRODUCTS.filter((p) => p.sections.includes('pooja')),
    []
  );
  const wishlistedProducts = useMemo(
    () => PRODUCTS.filter((p) => wishlistIds.includes(p.id)),
    [wishlistIds]
  );

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      toast.success(exists ? 'Removed from wishlist' : 'Saved to wishlist');
      return next;
    });
  };

  const handleAddToCart = (product: Product, selectedSwatch?: ColorSwatch) => {
    const swatch = selectedSwatch || product.swatches?.[0];
    const key = `${product.id}-${swatch?.id || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === key);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId: key,
          productId: product.id,
          title: product.title,
          image: product.image,
          unitPrice: product.price,
          mrp: product.mrp,
          quantity: 1,
          selectedSwatch: swatch,
        },
      ];
    });
    setIsCartOpen(true);
    toast.success(`Added ${product.title} to cart`);
  };

  const handleOpenCustomizer = (
    product: Product,
    selectedSwatch?: ColorSwatch
  ) => {
    setCustomizerTarget({ product, swatch: selectedSwatch });
  };

  const handleAddCustomizedToCart = (
    product: Product,
    config: CustomConfig,
    quantity: number
  ) => {
    const uniqueKey = `${product.id}-custom-${Date.now()}`;
    setCart((prev) => [
      ...prev,
      {
        cartItemId: uniqueKey,
        productId: product.id,
        title: product.title,
        image: product.image,
        unitPrice: product.price,
        mrp: product.mrp,
        quantity,
        selectedSwatch: config.baseColor,
        customConfig: config,
      },
    ]);
    setCustomizerTarget(null);
    setIsCartOpen(true);
    toast.success(`Custom ${product.title} added to cart`);
  };

  const handleAddCustomPrintToCart = (payload: {
    fileName: string;
    material: string;
    infill: number;
    layerHeight: string;
    color: ColorSwatch;
    unitPrice: number;
    quantity: number;
    summary: string;
    image: string;
  }) => {
    const uniqueKey = `printlab-${Date.now()}`;
    setCart((prev) => [
      ...prev,
      {
        cartItemId: uniqueKey,
        productId: 'custom-stl-print',
        title: `Custom 3D Print: ${payload.fileName}`,
        image: payload.image,
        unitPrice: payload.unitPrice,
        mrp: payload.unitPrice,
        quantity: payload.quantity,
        selectedSwatch: payload.color,
        printLabSummary: payload.summary,
      },
    ]);
    setIsCartOpen(true);
    toast.success('Custom STL print quote added to cart');
  };

  const handleUpdateQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleOrderConfirmed = (
    confirmation: OrderConfirmation,
    orderedItems: CartItem[]
  ) => {
    const newRecord = createAndSaveOrderRecord(confirmation, orderedItems);
    setOrders((prev) => [
      newRecord,
      ...prev.filter((o) => o.orderId !== newRecord.orderId),
    ]);
    setActiveTrackOrderId(newRecord.orderId);
    toast.success(`Order #${newRecord.orderId} confirmed!`);
  };

  const handleTrackOrderNavigation = (orderId: string) => {
    setActiveTrackOrderId(orderId);
    const el = document.getElementById('track-order');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategory = (
    _category: ProductCategory,
    targetSectionId: string
  ) => {
    const el = document.getElementById(targetSectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      {/* 1. Top Affiliate Bar + 2. Sticky White Header */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAffiliate={() => setIsAffiliateOpen(true)}
      />

      <main ref={mainRef} className="flex-1">
        {/* 3. Soft Mint Hero Section + 4-Card Strip */}
        <HeroSection
          heroProducts={heroProducts}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onCustomize={handleOpenCustomizer}
        />

        {/* 4. Shop by Category */}
        <div className="gsap-reveal-section">
          <CategoryGrid
            categories={CATEGORIES}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* 5. Best Sellers Carousel */}
        <div className="gsap-reveal-section">
          <CarouselSection
            id="best-sellers"
            title="Best Sellers"
            subtitle="Workshop favorites ordered across India every day"
            products={bestSellerProducts}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onCustomize={handleOpenCustomizer}
            surfaceClassName="bg-[#F8FAFC]"
          />
        </div>

        {/* 6. Customized Items (2-Col Mobile / 4-Col Desktop Grid) */}
        <section
          id="customized-items"
          aria-labelledby="customized-items-heading"
          className="gsap-reveal-section bg-white border-t border-[#E5E7EB]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6E72] mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Made to Order</span>
                </div>
                <h2
                  id="customized-items-heading"
                  className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]"
                >
                  Customized Items
                </h2>
                <p className="mt-1 text-sm sm:text-base text-[#64748B]">
                  Personalize with your vehicle registration, name, or gym plate color
                </p>
              </div>

              {/* shadcn/ui Tabs Filter */}
              <Tabs
                value={customFilter}
                onValueChange={(val) =>
                  setCustomFilter(
                    val as 'all' | 'plates' | 'gym-fitness' | 'names-tags'
                  )
                }
                className="self-start md:self-auto max-w-full overflow-x-auto"
              >
                <TabsList aria-label="Filter customized items">
                  <TabsTrigger value="all">All Custom</TabsTrigger>
                  <TabsTrigger value="plates">Number Plates</TabsTrigger>
                  <TabsTrigger value="gym-fitness">Gym Plates</TabsTrigger>
                  <TabsTrigger value="names-tags">Names &amp; Tags</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {customizedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onCustomize={handleOpenCustomizer}
                  showCustomizablePill={true}
                  showSwatches={true}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 7. Pooja & Decor Carousel */}
        <div className="gsap-reveal-section">
          <CarouselSection
            id="pooja-decor"
            title="Pooja & Decor"
            subtitle="Architectural shadow lamps, diya holders & custom photo lithophanes"
            products={poojaProducts}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onCustomize={handleOpenCustomizer}
            surfaceClassName="bg-[#F8FAFC]"
          />
        </div>

        {/* 8. Apna 3D Print Lab (STL Quote Estimator) */}
        <div className="gsap-reveal-section">
          <PrintLabSection onAddCustomPrintToCart={handleAddCustomPrintToCart} />
        </div>

        {/* 9. Live Order Tracking Section */}
        <div className="gsap-reveal-section">
          <OrderTrackingSection
            orders={orders}
            activeOrderId={activeTrackOrderId}
            onSelectOrderId={(id) => setActiveTrackOrderId(id)}
          />
        </div>

        {/* 10. Pan-India Delivery Trust Section */}
        <div className="gsap-reveal-section">
          <TrustDeliverySection />
        </div>
      </main>

      {/* Clean Light-Mode Storefront Footer */}
      <footer className="bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-heading text-base font-bold text-[#111827]">
              Apna 3D Product Shop —{' '}
              <span className="text-[#1F6E72]">Apna3DShop.in</span>
            </p>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Crafting Tomorrow&apos;s Reality · Precision FDM &amp; Resin 3D Printing
              Workshop, India
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_DIGITS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6E72] hover:underline font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-[#25D366]" aria-hidden="true" />
              <span>WhatsApp Order Desk: {WHATSAPP_DISPLAY}</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#64748B]">
            <button
              type="button"
              onClick={() => setIsAffiliateOpen(true)}
              className="hover:text-[#1F6E72] transition-colors cursor-pointer"
            >
              Affiliate Program (5%)
            </button>
            <a
              href="#print-lab"
              className="hover:text-[#1F6E72] transition-colors"
            >
              STL Quote Lab
            </a>
            <a
              href="#track-order"
              className="hover:text-[#1F6E72] transition-colors"
            >
              Track Order
            </a>
            <a
              href="#customized-items"
              className="hover:text-[#1F6E72] transition-colors"
            >
              Custom Keychains
            </a>
            <span className="text-[#111827]">
              © {new Date().getFullYear()} Apna3DShop.in
            </span>
          </div>
        </div>
      </footer>

      {/* shadcn Sonner Toaster */}
      <Toaster />

      {/* Modals, Drawers & Floating WhatsApp CTA */}
      <CustomizerModal
        product={customizerTarget?.product || null}
        initialSwatch={customizerTarget?.swatch}
        onClose={() => setCustomizerTarget(null)}
        onAddCustomizedToCart={handleAddCustomizedToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        onOrderConfirmed={handleOrderConfirmed}
        onTrackOrder={handleTrackOrderNavigation}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        products={wishlistedProducts}
        onClose={() => setIsWishlistOpen(false)}
        onRemove={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p)}
        onCustomize={(p) => handleOpenCustomizer(p)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={PRODUCTS}
        onClose={() => setIsSearchOpen(false)}
        onAddToCart={(p) => handleAddToCart(p)}
        onCustomize={(p) => handleOpenCustomizer(p)}
      />

      <AffiliateModal
        isOpen={isAffiliateOpen}
        onClose={() => setIsAffiliateOpen(false)}
      />

      <WhatsAppWidget />
    </div>
  );
}
