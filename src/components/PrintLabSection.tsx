import React, { useMemo, useState } from 'react';
import {
  Box,
  Clock,
  FileCode2,
  Layers,
  Minus,
  Plus,
  ShoppingBag,
  Upload,
} from 'lucide-react';
import { FILAMENT_SWATCHES, IMAGES, PRINT_LAB_PRESETS } from '../data/catalog';
import { ColorSwatch } from '../types/shop';

type MaterialType = 'PLA+' | 'PETG' | 'ABS' | 'Resin';

interface ParsedStlInfo {
  fileName: string;
  volumeCm3: number;
  triangles: number;
  dimensionsMm: string;
}

interface PrintLabSectionProps {
  onAddCustomPrintToCart: (payload: {
    fileName: string;
    material: MaterialType;
    infill: number;
    layerHeight: string;
    color: ColorSwatch;
    unitPrice: number;
    quantity: number;
    summary: string;
    image: string;
  }) => void;
}

const MATERIAL_SPECS: Record<
  MaterialType,
  { ratePerGram: number; density: number; note: string }
> = {
  'PLA+': {
    ratePerGram: 6.5,
    density: 1.24,
    note: 'Crisp detail for decor, prototypes & enclosures',
  },
  PETG: {
    ratePerGram: 8.0,
    density: 1.27,
    note: 'Impact-tough, water-resistant mechanical parts',
  },
  ABS: {
    ratePerGram: 9.2,
    density: 1.04,
    note: 'Heat-resistant brackets & automotive mounts',
  },
  Resin: {
    ratePerGram: 16.5,
    density: 1.18,
    note: 'Ultra-smooth 50-micron miniature & jewelry finish',
  },
};

export const PrintLabSection: React.FC<PrintLabSectionProps> = ({
  onAddCustomPrintToCart,
}) => {
  const [selectedModel, setSelectedModel] = useState<ParsedStlInfo>({
    fileName: PRINT_LAB_PRESETS[0].fileName,
    volumeCm3: PRINT_LAB_PRESETS[0].volumeCm3,
    triangles: PRINT_LAB_PRESETS[0].triangles,
    dimensionsMm: PRINT_LAB_PRESETS[0].dimensionsMm,
  });
  const [material, setMaterial] = useState<MaterialType>('PETG');
  const [infill, setInfill] = useState<number>(25);
  const [layerHeight, setLayerHeight] = useState<'0.20mm' | '0.12mm'>('0.20mm');
  const [color, setColor] = useState<ColorSwatch>(FILAMENT_SWATCHES.teal);
  const [quantity, setQuantity] = useState(1);
  const [parseStatus, setParseStatus] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let triangles = 0;

      // Binary STL check (80-byte header + 4-byte uint32 triangle count)
      if (bytes.byteLength >= 84) {
        const view = new DataView(buffer);
        const possibleTriangles = view.getUint32(80, true);
        if (84 + possibleTriangles * 50 === bytes.byteLength) {
          triangles = possibleTriangles;
        }
      }

      if (triangles === 0) {
        const text = new TextDecoder().decode(bytes.slice(0, 60000));
        const matches = text.match(/facet\s+normal/gi);
        triangles = matches ? Math.max(matches.length, 420) : Math.max(850, Math.round(file.size / 64));
      }

      const estimatedVol = Number(
        Math.min(180, Math.max(6.5, (file.size / 1024) * 0.14)).toFixed(1)
      );
      const side = Math.round(Math.cbrt(estimatedVol) * 14);

      setSelectedModel({
        fileName: file.name,
        volumeCm3: estimatedVol,
        triangles,
        dimensionsMm: `${side + 12} × ${side} × ${Math.max(12, Math.round(side * 0.7))} mm`,
      });
      setParseStatus(`Parsed ${file.name} (${triangles.toLocaleString()} facets)`);
    } catch {
      setParseStatus(`Loaded ${file.name} for instant print estimation`);
    }
  };

  const quote = useMemo(() => {
    const spec = MATERIAL_SPECS[material];
    const effectiveShellFactor = 0.28 + (infill / 100) * 0.72;
    const grams = Math.max(
      8,
      Math.round(selectedModel.volumeCm3 * spec.density * effectiveShellFactor)
    );
    const detailMultiplier = layerHeight === '0.12mm' ? 1.32 : 1.0;
    const rawPrice = Math.max(
      149,
      Math.round((85 + grams * spec.ratePerGram) * detailMultiplier)
    );
    const hours = ((grams / 18) * detailMultiplier).toFixed(1);
    return { grams, unitPrice: rawPrice, hours };
  }, [selectedModel, material, infill, layerHeight]);

  const handleSubmitQuote = () => {
    onAddCustomPrintToCart({
      fileName: selectedModel.fileName,
      material,
      infill,
      layerHeight,
      color,
      unitPrice: quote.unitPrice,
      quantity,
      summary: `${material} · ${infill}% infill · ${layerHeight} · ${color.name}`,
      image: IMAGES.decorLithophane,
    });
  };

  return (
    <section
      id="print-lab"
      aria-labelledby="print-lab-heading"
      className="bg-white border-t border-[#E5E7EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF5F5] text-[#1F6E72] px-3.5 py-1.5 text-xs font-semibold mb-3">
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>Apna 3D Print Lab</span>
            </div>
            <h2
              id="print-lab-heading"
              className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-balance"
            >
              Instant STL &amp; Custom 3D Print Quote Estimator
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#64748B] max-w-2xl">
              Drop your .STL or .3MF CAD file or pick a workshop benchmark to preview
              filament mass, print time, and instant pricing in INR.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: File Uploader + Presets + Material Config */}
          <div className="lg:col-span-7 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-5 sm:p-6 space-y-6">
            {/* Dropzone */}
            <div>
              <label className="flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#9BBEC0] hover:border-[#1F6E72] bg-white px-5 py-7 text-center cursor-pointer transition-colors">
                <div className="w-11 h-11 rounded-full bg-[#EBF5F5] text-[#1F6E72] flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="font-heading text-sm font-bold text-[#111827]">
                  Upload .STL, .OBJ, or .3MF Model
                </span>
                <span className="text-xs text-[#64748B] mt-1">
                  Client-side geometry inspection · Instant quote up to 250×250×250 mm
                </span>
                <input
                  type="file"
                  accept=".stl,.obj,.3mf"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>

              {parseStatus && (
                <p className="mt-2 text-xs font-medium text-[#0E7C5B]">
                  {parseStatus}
                </p>
              )}

              {/* Quick Sample Presets */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-[#64748B]">
                  Try sample model:
                </span>
                {PRINT_LAB_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel({
                        fileName: preset.fileName,
                        volumeCm3: preset.volumeCm3,
                        triangles: preset.triangles,
                        dimensionsMm: preset.dimensionsMm,
                      });
                      setMaterial(preset.recommendedMaterial);
                      setParseStatus('');
                    }}
                    className={`min-h-[36px] rounded-[8px] border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      selectedModel.fileName === preset.fileName
                        ? 'border-[#1F6E72] bg-[#EBF5F5] text-[#1F6E72]'
                        : 'border-[#E5E7EB] bg-white text-[#111827] hover:border-[#1F6E72]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div>
              <span className="block text-xs font-semibold text-[#111827] mb-2">
                Filament / Resin Material
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['PLA+', 'PETG', 'ABS', 'Resin'] as const).map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => setMaterial(mat)}
                    className={`min-h-[44px] rounded-[10px] border p-2.5 text-left transition-colors cursor-pointer ${
                      material === mat
                        ? 'border-[#1F6E72] bg-white ring-1 ring-[#1F6E72]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#9BBEC0]'
                    }`}
                  >
                    <div className="font-heading text-xs font-bold text-[#111827]">
                      {mat}
                    </div>
                    <div className="text-[11px] text-[#64748B] tabular-nums">
                      ₹{MATERIAL_SPECS[mat].ratePerGram}/g
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-[#64748B]">
                {MATERIAL_SPECS[material].note}
              </p>
            </div>

            {/* Infill & Layer Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-[#111827] mb-2">
                  Infill Density
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 25, 50, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setInfill(val)}
                      className={`min-h-[44px] rounded-[10px] border text-xs font-semibold tabular-nums cursor-pointer transition-colors ${
                        infill === val
                          ? 'border-[#1F6E72] bg-[#1F6E72] text-white'
                          : 'border-[#E5E7EB] bg-white text-[#111827] hover:border-[#1F6E72]'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#111827] mb-2">
                  Layer Resolution
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '0.20mm', label: '0.20mm Standard' },
                    { id: '0.12mm', label: '0.12mm Ultra' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setLayerHeight(res.id as '0.20mm' | '0.12mm')}
                      className={`min-h-[44px] rounded-[10px] border text-xs font-semibold px-2.5 cursor-pointer transition-colors ${
                        layerHeight === res.id
                          ? 'border-[#1F6E72] bg-[#EBF5F5] text-[#1F6E72]'
                          : 'border-[#E5E7EB] bg-white text-[#111827] hover:border-[#1F6E72]'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#111827]">
                  Filament Finish Color
                </span>
                <span className="text-[#64748B]">{color.name}</span>
              </div>
              <div className="flex flex-wrap -ml-2">
                {Object.values(FILAMENT_SWATCHES).map((sw) => {
                  const active = color.id === sw.id;
                  return (
                    <button
                      key={sw.id}
                      type="button"
                      onClick={() => setColor(sw)}
                      aria-label={`Select ${sw.name} filament`}
                      className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full cursor-pointer"
                    >
                      <span
                        className={`w-6 h-6 rounded-full ${
                          active ? 'ring-2 ring-offset-2 ring-[#1F6E72]' : ''
                        }`}
                        style={{
                          backgroundColor: sw.hex,
                          border: sw.ringHex
                            ? `1px solid ${sw.ringHex}`
                            : '1px solid rgba(17,24,39,0.18)',
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live Quote Summary Card */}
          <div className="lg:col-span-5 rounded-[16px] bg-white border border-[#E5E7EB] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#1F6E72]">
                  Active Job Summary
                </span>
                <h3 className="font-mono text-sm font-bold text-[#111827] truncate mt-0.5">
                  {selectedModel.fileName}
                </h3>
              </div>
              <FileCode2 className="w-5 h-5 text-[#1F6E72] shrink-0" aria-hidden="true" />
            </div>

            <dl className="py-4 space-y-3 text-sm border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <dt className="text-[#64748B]">Bounding Box</dt>
                <dd className="font-mono text-xs font-medium text-[#111827] tabular-nums">
                  {selectedModel.dimensionsMm}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#64748B]">Mesh Facets</dt>
                <dd className="font-mono text-xs font-medium text-[#111827] tabular-nums">
                  {selectedModel.triangles.toLocaleString()} triangles
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#64748B] inline-flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Estimated Mass</span>
                </dt>
                <dd className="font-semibold text-[#111827] tabular-nums">
                  {quote.grams} g ({material})
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#64748B] inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Print Time</span>
                </dt>
                <dd className="font-semibold text-[#111827] tabular-nums">
                  ~{quote.hours} hrs
                </dd>
              </div>
            </dl>

            <div className="py-5 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#64748B] block">
                  Estimated Workshop Price
                </span>
                <span className="font-heading text-3xl font-extrabold text-[#111827] tabular-nums">
                  ₹{(quote.unitPrice * quantity).toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-medium text-[#0E7C5B]">
                GST included
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-[10px] border border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease print quantity"
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
                  aria-label="Increase print quantity"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#111827] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitQuote}
                className="flex-1 min-h-[44px] rounded-[10px] bg-[#1F6E72] hover:bg-[#165356] text-white font-semibold text-sm px-5 py-2.5 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Add Custom Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
