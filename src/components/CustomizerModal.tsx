import React, { useEffect, useState } from 'react';
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { FILAMENT_SWATCHES } from '../data/catalog';
import { ColorSwatch, CustomConfig, Product } from '../types/shop';

interface CustomizerModalProps {
  product: Product | null;
  initialSwatch?: ColorSwatch;
  onClose: () => void;
  onAddCustomizedToCart: (
    product: Product,
    config: CustomConfig,
    quantity: number
  ) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  product,
  initialSwatch,
  onClose,
  onAddCustomizedToCart,
}) => {
  const mode = product?.customizerMode || 'plate';

  const [primaryText, setPrimaryText] = useState('MH 02 CQ 5432');
  const [secondaryText, setSecondaryText] = useState('MUMBAI, MAHARASHTRA');
  const [plateStyle, setPlateStyle] = useState<
    'white-private' | 'yellow-commercial' | 'green-ev'
  >('white-private');
  const [baseColor, setBaseColor] = useState<ColorSwatch>(
    initialSwatch || FILAMENT_SWATCHES.teal
  );
  const [accentColor, setAccentColor] = useState<ColorSwatch>(
    FILAMENT_SWATCHES.white
  );
  const [ringFinish, setRingFinish] = useState<'Silver Steel' | 'Matte Black'>(
    'Silver Steel'
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [photoFileName, setPhotoFileName] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    const m = product.customizerMode || 'plate';
    if (m === 'plate') {
      setPrimaryText('MH 02 CQ 5432');
      setSecondaryText('MUMBAI, MAHARASHTRA');
      setBaseColor(initialSwatch || FILAMENT_SWATCHES.white);
      setAccentColor(FILAMENT_SWATCHES.charcoal);
    } else if (m === 'name') {
      setPrimaryText('AARAV');
      setSecondaryText('');
      setBaseColor(initialSwatch || FILAMENT_SWATCHES.teal);
      setAccentColor(FILAMENT_SWATCHES.white);
    } else if (m === 'gym') {
      setPrimaryText('20 KG');
      setSecondaryText('STRENGTH');
      setBaseColor(initialSwatch || FILAMENT_SWATCHES.charcoal);
      setAccentColor(FILAMENT_SWATCHES.white);
    } else if (m === 'lithophane') {
      setPrimaryText('Home Sweet Home');
      setSecondaryText('Warm 2700K Oak Base');
      setBaseColor(FILAMENT_SWATCHES.white);
      setAccentColor(FILAMENT_SWATCHES.amber);
    }
    setQuantity(1);
    setPhotoDataUrl(undefined);
    setPhotoFileName(undefined);
  }, [product, initialSwatch]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const config: CustomConfig = {
      mode,
      primaryText: primaryText.trim() || (mode === 'gym' ? '20 KG' : 'APNA 3D'),
      secondaryText: secondaryText.trim() || undefined,
      plateStyle: mode === 'plate' ? plateStyle : undefined,
      baseColor,
      accentColor,
      ringFinish,
      photoDataUrl,
      photoFileName,
    };
    onAddCustomizedToCart(product, config, quantity);
  };

  const plateColors = {
    'white-private': { bg: '#FFFFFF', text: '#111827', border: '#CBD5E1' },
    'yellow-commercial': { bg: '#FACC15', text: '#111827', border: '#EAB308' },
    'green-ev': { bg: '#0E7C5B', text: '#FFFFFF', border: '#0B6348' },
  }[plateStyle];

  const swatchChoices = Object.values(FILAMENT_SWATCHES);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[16px] bg-white border border-[#E5E7EB] shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6E72]">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Live 3D Customizer</span>
            </div>
            <h2
              id="customizer-modal-title"
              className="font-heading text-lg sm:text-xl font-bold text-[#111827] truncate"
            >
              {product.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close customizer modal"
            className="min-w-[44px] min-h-[44px] rounded-full border border-[#E5E7EB] hover:bg-[#F8FAFC] flex items-center justify-center text-[#111827] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleConfirm} className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Live Preview Canvas */}
            <div className="md:col-span-6 rounded-[16px] bg-[#EBF5F5]/65 border border-[#E5E7EB] p-6 flex flex-col items-center justify-center min-h-[270px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-5">
                Live Extrusion Preview
              </span>

              {mode === 'plate' && (
                <div className="flex items-center justify-center">
                  <div
                    className="relative flex items-stretch rounded-[10px] border-2 shadow-md overflow-hidden select-none transition-colors"
                    style={{
                      backgroundColor: plateColors.bg,
                      borderColor: plateColors.border,
                      color: plateColors.text,
                    }}
                  >
                    {/* Blue IND Band */}
                    <div className="w-9 bg-[#1D4ED8] text-white flex flex-col items-center justify-center py-2 px-1 shrink-0">
                      <span className="w-4 h-4 rounded-full border border-white/70 flex items-center justify-center text-[8px] font-bold mb-1">
                        IN
                      </span>
                      <span className="font-mono text-[10px] font-bold tracking-wider">
                        IND
                      </span>
                    </div>

                    {/* Raised Plate Characters */}
                    <div className="px-4 py-2.5 pr-7 text-left">
                      <div className="font-mono text-lg sm:text-xl font-extrabold tracking-wider leading-none uppercase">
                        {primaryText || 'MH 02 CQ 5432'}
                      </div>
                      {secondaryText && (
                        <div className="font-heading text-[10px] font-bold tracking-widest uppercase mt-1.5 opacity-85">
                          {secondaryText}
                        </div>
                      )}
                    </div>

                    {/* Keyring eyelet */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#EBF5F5] border-2 border-slate-400" />
                  </div>
                  {/* Metal Split Ring */}
                  <div
                    aria-hidden="true"
                    className={`-ml-1.5 w-9 h-9 rounded-full border-[4px] ${
                      ringFinish === 'Matte Black'
                        ? 'border-[#1F2937]'
                        : 'border-slate-300'
                    }`}
                  />
                </div>
              )}

              {mode === 'name' && (
                <div className="flex items-center justify-center">
                  {/* Metal Clasp Ring */}
                  <div
                    aria-hidden="true"
                    className={`-mr-2 z-10 w-8 h-8 rounded-full border-[4px] ${
                      ringFinish === 'Matte Black'
                        ? 'border-[#1F2937]'
                        : 'border-slate-300'
                    }`}
                  />
                  <div
                    className="relative rounded-full px-6 py-3 shadow-md border-2 transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: baseColor.hex,
                      borderColor: 'rgba(17,24,39,0.14)',
                    }}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#EBF5F5] border border-slate-400 shrink-0" />
                    <span
                      className="font-heading text-xl sm:text-2xl font-extrabold tracking-wide uppercase"
                      style={{
                        color:
                          baseColor.id === 'white'
                            ? '#1F6E72'
                            : accentColor.hex,
                        textShadow: '0 1px 0 rgba(0,0,0,0.22)',
                      }}
                    >
                      {primaryText || 'AARAV'}
                    </span>
                  </div>
                </div>
              )}

              {mode === 'gym' && (
                <div className="flex flex-col items-center">
                  <div
                    aria-hidden="true"
                    className={`-mb-2 z-10 w-8 h-8 rounded-full border-[4px] ${
                      ringFinish === 'Matte Black'
                        ? 'border-[#1F2937]'
                        : 'border-slate-300'
                    }`}
                  />
                  <div
                    className="w-36 h-36 rounded-full border-[6px] shadow-md flex flex-col items-center justify-center relative transition-colors"
                    style={{
                      backgroundColor: baseColor.hex,
                      borderColor:
                        baseColor.id === 'white' ? '#CBD5E1' : 'rgba(255,255,255,0.18)',
                      color: baseColor.id === 'white' ? '#111827' : '#FFFFFF',
                    }}
                  >
                    <div className="w-24 h-24 rounded-full border border-current/25 flex flex-col items-center justify-center px-2 text-center">
                      <span className="font-heading text-sm font-extrabold tracking-tight uppercase leading-tight">
                        {primaryText || '20 KG'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#EBF5F5] border-2 border-current/40 my-1.5" />
                      <span className="text-[9px] font-bold tracking-widest uppercase opacity-80">
                        {secondaryText || 'STRENGTH'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'lithophane' && (
                <div className="flex flex-col items-center">
                  <div className="w-40 h-44 rounded-t-[18px] bg-gradient-to-b from-[#FFFDF7] to-[#FDE68A]/55 border border-[#E5E7EB] shadow-md overflow-hidden flex flex-col items-center justify-center p-2">
                    {photoDataUrl ? (
                      <img
                        src={photoDataUrl}
                        alt="Uploaded lithophane preview"
                        className="w-full h-full object-cover rounded-[10px] sepia contrast-110 brightness-105"
                      />
                    ) : (
                      <div className="text-center px-3">
                        <Upload className="w-6 h-6 text-[#1F6E72] mx-auto mb-1.5" />
                        <p className="text-xs font-medium text-[#111827]">
                          Upload photo for 3D lithophane relief
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="w-44 h-6 rounded-b-[10px] bg-[#D6B17E] border border-[#B58F5B] flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-[#111827] truncate px-2">
                      {primaryText || 'Home Sweet Home'}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-5 text-[11px] text-[#64748B] text-center">
                Material: {product.material || 'Matte PLA+'} · {product.dimensions}
              </p>
            </div>

            {/* Customization Controls */}
            <div className="md:col-span-6 space-y-4">
              {mode === 'lithophane' && (
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Upload Memory Photo (JPG / PNG)
                  </label>
                  <label className="min-h-[44px] flex items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#1F6E72] bg-[#EBF5F5]/40 hover:bg-[#EBF5F5] px-4 py-2.5 text-xs font-semibold text-[#1F6E72] cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span className="truncate">
                      {photoFileName ? photoFileName : 'Choose photo from device'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}

              <div>
                <label
                  htmlFor="custom-primary-text"
                  className="block text-xs font-semibold text-[#111827] mb-1.5"
                >
                  {mode === 'plate'
                    ? 'Vehicle Registration Number'
                    : mode === 'gym'
                    ? 'Weight Label / Initials'
                    : mode === 'lithophane'
                    ? 'Engraved Base Caption'
                    : 'Custom 3D Name'}
                </label>
                <input
                  id="custom-primary-text"
                  type="text"
                  maxLength={mode === 'plate' ? 15 : mode === 'lithophane' ? 28 : 14}
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  required
                  className="w-full min-h-[44px] rounded-[10px] border border-[#E5E7EB] px-3.5 py-2 text-sm font-medium text-[#111827] focus:border-[#1F6E72] focus:outline-none"
                />
              </div>

              {(mode === 'plate' || mode === 'gym') && (
                <div>
                  <label
                    htmlFor="custom-secondary-text"
                    className="block text-xs font-semibold text-[#111827] mb-1.5"
                  >
                    {mode === 'plate'
                      ? 'City / State Subtitle (Optional)'
                      : 'Bottom Embossed Word'}
                  </label>
                  <input
                    id="custom-secondary-text"
                    type="text"
                    maxLength={24}
                    value={secondaryText}
                    onChange={(e) => setSecondaryText(e.target.value)}
                    className="w-full min-h-[44px] rounded-[10px] border border-[#E5E7EB] px-3.5 py-2 text-sm font-medium text-[#111827] focus:border-[#1F6E72] focus:outline-none"
                  />
                </div>
              )}

              {mode === 'plate' && (
                <div>
                  <span className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Number Plate Variant
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'white-private', label: 'White IND' },
                      { id: 'yellow-commercial', label: 'Yellow' },
                      { id: 'green-ev', label: 'EV Green' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setPlateStyle(
                            opt.id as
                              | 'white-private'
                              | 'yellow-commercial'
                              | 'green-ev'
                          )
                        }
                        className={`min-h-[44px] rounded-[10px] border text-xs font-semibold px-2 transition-colors cursor-pointer ${
                          plateStyle === opt.id
                            ? 'border-[#1F6E72] bg-[#EBF5F5] text-[#1F6E72]'
                            : 'border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#111827]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(mode === 'name' || mode === 'gym') && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[#111827]">
                      Filament Base Color
                    </span>
                    <span className="text-[#64748B]">{baseColor.name}</span>
                  </div>
                  <div className="flex flex-wrap -ml-2">
                    {swatchChoices.map((sw) => {
                      const active = baseColor.id === sw.id;
                      return (
                        <button
                          key={sw.id}
                          type="button"
                          onClick={() => setBaseColor(sw)}
                          aria-label={`Select ${sw.name}`}
                          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full cursor-pointer"
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              active ? 'ring-2 ring-offset-2 ring-[#1F6E72]' : ''
                            }`}
                            style={{
                              backgroundColor: sw.hex,
                              border: sw.ringHex
                                ? `1px solid ${sw.ringHex}`
                                : '1px solid rgba(17,24,39,0.18)',
                            }}
                          >
                            {active && (
                              <Check
                                className={`w-3.5 h-3.5 ${
                                  sw.id === 'white'
                                    ? 'text-[#111827]'
                                    : 'text-white'
                                }`}
                              />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode !== 'lithophane' && (
                <div>
                  <span className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Keyring Hardware Finish
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Silver Steel', 'Matte Black'] as const).map((finish) => (
                      <button
                        key={finish}
                        type="button"
                        onClick={() => setRingFinish(finish)}
                        className={`min-h-[44px] rounded-[10px] border text-xs font-semibold px-3 transition-colors cursor-pointer ${
                          ringFinish === finish
                            ? 'border-[#1F6E72] bg-[#EBF5F5] text-[#1F6E72]'
                            : 'border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#111827]'
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Total Action */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-[10px] border border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#111827] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#111827] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-[10px] bg-[#1F6E72] hover:bg-[#165356] text-white font-semibold text-sm px-5 py-2.5 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span className="tabular-nums">
                    Add to cart · ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
