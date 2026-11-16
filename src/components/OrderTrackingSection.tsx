import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Package,
  Printer,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { OrderTrackingRecord } from '../types/shop';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface OrderTrackingSectionProps {
  orders: OrderTrackingRecord[];
  activeOrderId: string | null;
  onSelectOrderId: (id: string) => void;
}

const STAGE_ICONS = [Package, Printer, ShieldCheck, Truck, CheckCircle2];

export const OrderTrackingSection: React.FC<OrderTrackingSectionProps> = ({
  orders,
  activeOrderId,
  onSelectOrderId,
}) => {
  const [query, setQuery] = useState(activeOrderId || 'APNA-4821');
  const [notFoundError, setNotFoundError] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const selectedOrder =
    orders.find((o) => o.orderId === (activeOrderId || 'APNA-4821')) ||
    orders[0];

  useEffect(() => {
    if (activeOrderId) {
      setQuery(activeOrderId);
      setNotFoundError('');
    }
  }, [activeOrderId]);

  useEffect(() => {
    if (!selectedOrder) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (progressBarRef.current) {
        const pct = (selectedOrder.currentStage / 4) * 100;
        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          {
            scaleX: pct / 100,
            duration: 0.65,
            ease: 'power3.out',
            transformOrigin: 'left center',
          }
        );
      }

      gsap.fromTo(
        '.tracking-step-item',
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        }
      );
    }, timelineRef);

    return () => ctx.revert();
  }, [selectedOrder?.orderId, selectedOrder?.currentStage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = query.trim().toUpperCase();
    const cleanedDigits = query.replace(/\D/g, '');

    const match = orders.find(
      (o) =>
        o.orderId.toUpperCase() === cleaned ||
        (cleanedDigits.length >= 6 && o.phone.includes(cleanedDigits))
    );

    if (match) {
      onSelectOrderId(match.orderId);
      setNotFoundError('');
    } else {
      setNotFoundError(
        `No order matched "${query}". Try APNA-4821, APNA-4790, or place an order in Cart.`
      );
    }
  };

  const whatsappSupportUrl = selectedOrder
    ? `https://wa.me/919316113422?text=${encodeURIComponent(
        `Hi Apna3DShop! I'm checking status for Order #${selectedOrder.orderId} (${selectedOrder.customerName}).`
      )}`
    : 'https://wa.me/919316113422';

  return (
    <section
      id="track-order"
      aria-labelledby="track-order-heading"
      className="bg-white border-t border-[#E5E7EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="mint" className="mb-3 px-3 py-1 text-xs font-semibold">
              <Truck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Live Workshop &amp; Courier Tracking</span>
            </Badge>
            <h2
              id="track-order-heading"
              className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-balance"
            >
              Track Your 3D Print Order
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#64748B]">
              Follow your print from slicing and nozzle extrusion to Pan-India
              doorstep delivery.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Lookup Panel (shadcn Card + Input + Button) */}
          <Card className="lg:col-span-5 bg-[#F8FAFC]">
            <CardHeader>
              <CardTitle className="text-base">Find Your Order</CardTitle>
              <p className="text-xs text-[#64748B]">
                Enter your Order ID (e.g. APNA-4821) or registered 10-digit mobile
                number.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Order ID or Phone..."
                    aria-label="Enter Order ID or phone number"
                    className="pl-10 font-mono uppercase"
                  />
                </div>
                <Button type="submit">Track</Button>
              </form>

              {notFoundError && (
                <p className="text-xs font-medium text-[#C8232C]">
                  {notFoundError}
                </p>
              )}

              <div>
                <span className="block text-xs font-semibold text-[#64748B] mb-2">
                  Recent / Sample Orders
                </span>
                <div className="flex flex-wrap gap-2">
                  {orders.slice(0, 4).map((ord) => {
                    const isSelected = selectedOrder?.orderId === ord.orderId;
                    return (
                      <Button
                        key={ord.orderId}
                        type="button"
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => {
                          onSelectOrderId(ord.orderId);
                          setQuery(ord.orderId);
                          setNotFoundError('');
                        }}
                        className="font-mono"
                      >
                        {ord.orderId}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {selectedOrder && (
                <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Customer</span>
                    <span className="font-semibold text-[#111827] text-right">
                      {selectedOrder.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Destination</span>
                    <span className="font-semibold text-[#111827] text-right">
                      {selectedOrder.cityLabel}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Courier Partner</span>
                    <span className="font-semibold text-[#111827] text-right">
                      {selectedOrder.courierName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">AWB / Reference</span>
                    <span className="font-mono font-semibold text-[#1F6E72] text-right">
                      {selectedOrder.awbNumber}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button
                      asChild
                      variant="whatsapp"
                      size="sm"
                      className="w-full"
                    >
                      <a
                        href={whatsappSupportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Order Help (+91 93161 13422)</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Live Timeline Card */}
          {selectedOrder && (
            <Card ref={timelineRef} className="lg:col-span-7 bg-white">
              <CardHeader className="border-b border-[#E5E7EB] pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#1F6E72]">
                        #{selectedOrder.orderId}
                      </span>
                      <Badge variant="discount">
                        {selectedOrder.steps[selectedOrder.currentStage].label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-1">
                      {selectedOrder.estimatedDelivery}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#64748B] block">
                      Order Total ({selectedOrder.paymentMethod})
                    </span>
                    <span className="font-heading text-lg font-bold text-[#111827] tabular-nums">
                      ₹{selectedOrder.totalPaid.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#64748B] mt-2">
                  Items: <span className="text-[#111827] font-medium">{selectedOrder.itemsSummary}</span>
                </p>

                {/* GSAP Progress Bar */}
                <div className="mt-4 h-2 w-full rounded-full bg-[#EBF5F5] overflow-hidden">
                  <div
                    ref={progressBarRef}
                    className="h-full w-full rounded-full bg-[#1F6E72]"
                    style={{
                      transform: `scaleX(${selectedOrder.currentStage / 4})`,
                      transformOrigin: 'left center',
                    }}
                  />
                </div>
              </CardHeader>

              <CardContent className="pt-5">
                <ol className="space-y-4">
                  {selectedOrder.steps.map((step, idx) => {
                    const isCompleted = idx < selectedOrder.currentStage;
                    const isCurrent = idx === selectedOrder.currentStage;
                    const StepIcon = STAGE_ICONS[idx] || Package;

                    return (
                      <li
                        key={step.label}
                        className="tracking-step-item flex items-start gap-3.5"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                            isCurrent
                              ? 'bg-[#1F6E72] text-white border-[#1F6E72]'
                              : isCompleted
                              ? 'bg-[#EBF5F5] text-[#1F6E72] border-[#9BBEC0]'
                              : 'bg-[#F8FAFC] text-[#64748B] border-[#E5E7EB]'
                          }`}
                        >
                          <StepIcon className="w-4 h-4" aria-hidden="true" />
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`font-heading text-sm font-bold ${
                                isCurrent || isCompleted
                                  ? 'text-[#111827]'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="font-mono text-[11px] text-[#64748B] tabular-nums">
                              {step.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};
