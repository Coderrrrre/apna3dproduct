import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { CartItem, OrderConfirmation } from '../types/shop';
import { ResilientImage } from './ResilientImage';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderConfirmed: (confirmation: OrderConfirmation, items: CartItem[]) => void;
  onTrackOrder: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderConfirmed,
  onTrackOrder,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const discount = promoApplied ? Math.round(subtotal * 0.2) : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount === 0 || afterDiscount >= 499 ? 0 : 49;
  const grandTotal = afterDiscount + shipping;
  const freeShippingRemaining = Math.max(0, 499 - afterDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === 'APNA20') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('Invalid code. Try APNA20 for 20% off.');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = `APNA-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCount = items.reduce((s, i) => s + i.quantity, 0);
    const nextConf: OrderConfirmation = {
      orderId: orderNum,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      paymentMethod,
      totalPaid: grandTotal,
      itemCount: totalCount,
      estimatedDispatch: 'Within 48 hours from workshop',
    };
    setConfirmation(nextConf);
    onOrderConfirmed(nextConf, items);
    setStep('confirmed');
    onClearCart();
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmation(null);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseDrawer();
      }}
    >
      <div className="w-full max-w-md bg-white h-full flex flex-col border-l border-[#E5E7EB] shadow-2xl">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                aria-label="Back to cart items"
                className="min-w-[44px] min-h-[44px] -ml-2 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center text-[#111827] cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-heading text-lg font-bold text-[#111827]">
              {step === 'cart'
                ? 'Your Cart'
                : step === 'checkout'
                ? 'Delivery Verification'
                : 'Order Confirmed'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close cart drawer"
            className="min-w-[44px] min-h-[44px] rounded-full hover:bg-[#F8FAFC] flex items-center justify-center text-[#111827] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {step === 'confirmed' && confirmation ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
            <div className="rounded-[16px] bg-[#EBF5F5]/65 border border-[#E5E7EB] p-6 text-center">
              <CheckCircle2
                className="w-12 h-12 text-[#0E7C5B] mx-auto mb-3"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1F6E72]">
                Order #{confirmation.orderId} Confirmed
              </span>
              <h3 className="font-heading text-xl font-bold text-[#111827] mt-1">
                Preparing Your 3D Print
              </h3>
              <p className="text-sm text-[#64748B] mt-2">
                Thank you, {confirmation.customerName}. Your {confirmation.itemCount}{' '}
                item{confirmation.itemCount > 1 ? 's' : ''} will ship to PIN{' '}
                <span className="font-mono font-semibold text-[#111827]">
                  {confirmation.pincode}
                </span>
                .
              </p>

              <dl className="mt-6 pt-5 border-t border-[#E5E7EB] space-y-2 text-left text-xs sm:text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#64748B]">Payment Method</dt>
                  <dd className="font-semibold text-[#111827]">
                    {confirmation.paymentMethod === 'COD'
                      ? 'Cash on Delivery'
                      : 'UPI Instant Pay'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#64748B]">Total Payable</dt>
                  <dd className="font-bold text-[#111827] tabular-nums">
                    ₹{confirmation.totalPaid.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#64748B]">Dispatch Timeline</dt>
                  <dd className="font-medium text-[#0E7C5B]">
                    {confirmation.estimatedDispatch}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 space-y-2.5">
                <Button
                  type="button"
                  onClick={() => {
                    const id = confirmation.orderId;
                    handleCloseDrawer();
                    onTrackOrder(id);
                  }}
                  className="w-full"
                >
                  <Truck className="w-4 h-4" aria-hidden="true" />
                  <span>Track Order #{confirmation.orderId}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDrawer}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EBF5F5] text-[#1F6E72] flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#111827]">
              Your cart is empty
            </h3>
            <p className="text-sm text-[#64748B] mt-1 max-w-xs">
              Explore custom 3D keychains, vehicle plates, or upload an STL file in
              Apna 3D Print Lab.
            </p>
            <Button
              type="button"
              onClick={handleCloseDrawer}
              className="mt-5 px-6"
            >
              Browse Catalog
            </Button>
          </div>
        ) : step === 'cart' ? (
          <>
            {/* Free Shipping Progress */}
            <div className="bg-[#EBF5F5] px-5 py-2.5 text-xs font-medium text-[#111827] border-b border-[#E5E7EB]">
              {freeShippingRemaining > 0 ? (
                <span>
                  Add{' '}
                  <strong className="tabular-nums text-[#1F6E72]">
                    ₹{freeShippingRemaining}
                  </strong>{' '}
                  more for Free Pan-India Delivery
                </span>
              ) : (
                <span className="text-[#0E7C5B] font-semibold">
                  You unlocked Free Pan-India Delivery
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB] px-5">
              {items.map((item) => (
                <div key={item.cartItemId} className="py-4 flex gap-3.5">
                  <div className="w-20 h-20 rounded-[12px] overflow-hidden border border-[#E5E7EB] bg-[#F8FAFC] shrink-0">
                    <ResilientImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-sm font-bold text-[#111827] leading-snug">
                        {item.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="min-w-[36px] min-h-[36px] -mt-1 -mr-1 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#C8232C] flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.customConfig && (
                      <p className="text-xs text-[#1F6E72] font-medium mt-0.5 truncate">
                        &ldquo;{item.customConfig.primaryText}&rdquo;
                        {item.customConfig.secondaryText
                          ? ` · ${item.customConfig.secondaryText}`
                          : ''}
                        {` · ${item.customConfig.baseColor.name}`}
                      </p>
                    )}

                    {item.printLabSummary && (
                      <p className="text-xs text-[#1F6E72] font-medium mt-0.5">
                        {item.printLabSummary}
                      </p>
                    )}

                    {!item.customConfig && !item.printLabSummary && item.selectedSwatch && (
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Color: {item.selectedSwatch.name}
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-[8px] border border-[#E5E7EB]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, -1)}
                          aria-label={`Decrease quantity for ${item.title}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#111827] hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, 1)}
                          aria-label={`Increase quantity for ${item.title}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#111827] hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-heading text-sm font-bold text-[#111827] tabular-nums">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo + Totals Footer */}
            <div className="border-t border-[#E5E7EB] bg-[#F8FAFC] p-5 space-y-4">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (try APNA20)"
                    aria-label="Promo code"
                    className="pl-9 text-xs"
                  />
                </div>
                <Button type="submit" variant="outline" className="px-4 text-xs">
                  Apply
                </Button>
              </form>

              {promoApplied && (
                <p className="text-xs font-semibold text-[#0E7C5B]">
                  APNA20 applied — 20% off (-₹{discount})
                </p>
              )}
              {promoError && (
                <p className="text-xs font-medium text-[#C8232C]">{promoError}</p>
              )}

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#0E7C5B]">
                    <span>Promo Discount (20%)</span>
                    <span className="tabular-nums">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#64748B]">
                  <span>Pan-India Shipping</span>
                  <span className="tabular-nums">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-heading text-base font-bold text-[#111827] pt-2 border-t border-[#E5E7EB]">
                  <span>Total</span>
                  <span className="tabular-nums">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        ) : (
          /* Checkout Verification Form */
          <form
            onSubmit={handlePlaceOrder}
            className="flex-1 overflow-y-auto p-5 space-y-4"
          >
            <div>
              <label
                htmlFor="checkout-name"
                className="block text-xs font-semibold text-[#111827] mb-1.5"
              >
                Full Name
              </label>
              <Input
                id="checkout-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-xs font-semibold text-[#111827] mb-1.5"
              >
                Mobile Number (WhatsApp Updates)
              </label>
              <Input
                id="checkout-phone"
                type="tel"
                required
                pattern="[0-9+\s-]{10,14}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 93161 13422"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-address"
                className="block text-xs font-semibold text-[#111827] mb-1.5"
              >
                Street Address &amp; Landmark
              </label>
              <textarea
                id="checkout-address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / House No., Building, Area, City"
                className="w-full rounded-[10px] border border-[#E5E7EB] p-3 text-sm focus:border-[#1F6E72] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-pincode"
                className="block text-xs font-semibold text-[#111827] mb-1.5"
              >
                Delivery PIN Code
              </label>
              <Input
                id="checkout-pincode"
                type="text"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit Indian PIN code (e.g. 400001)"
                className="font-mono"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#111827] mb-1.5">
                Payment Method
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'UPI', label: 'UPI (GPay / PhonePe)' },
                  { id: 'COD', label: 'Cash on Delivery' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as 'UPI' | 'COD')}
                    className={`min-h-[44px] rounded-[10px] border px-3 text-xs font-semibold cursor-pointer transition-colors ${
                      paymentMethod === opt.id
                        ? 'border-[#1F6E72] bg-[#EBF5F5] text-[#1F6E72]'
                        : 'border-[#E5E7EB] bg-white text-[#111827]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <div className="flex justify-between font-heading text-base font-bold text-[#111827] mb-4">
                <span>Order Total</span>
                <span className="tabular-nums">₹{grandTotal.toFixed(2)}</span>
              </div>
              <Button type="submit" className="w-full">
                Confirm &amp; Place Order
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
