import React from 'react';
import { Clock, MapPin, ShieldCheck, Truck } from 'lucide-react';

export const TrustDeliverySection: React.FC = () => {
  const pillars = [
    {
      icon: Clock,
      title: '48-Hour Custom Dispatch',
      description:
        'Each personalized plate, keychain, and shadow lamp is sliced, printed, and hand-inspected before shipping.',
    },
    {
      icon: MapPin,
      title: '28,000+ PIN Codes Covered',
      description:
        'Reliable tracked courier delivery via BlueDart, Delhivery, and India Post from Kashmir to Kanyakumari.',
    },
    {
      icon: ShieldCheck,
      title: 'UPI & Cash on Delivery',
      description:
        'Seamless UPI checkout or Cash on Delivery with protective foam-cushioned recyclable boxes.',
    },
  ];

  return (
    <section
      aria-labelledby="pan-india-heading"
      className="bg-[#F8FAFC] border-t border-[#E5E7EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-6 sm:p-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF5F5] text-[#1F6E72] px-3.5 py-1.5 text-xs font-semibold">
              <Truck className="w-4 h-4" aria-hidden="true" />
              <span>Pan-India Delivery</span>
            </div>

            <h2
              id="pan-india-heading"
              className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] mt-4 text-balance"
            >
              We ship your custom prints across all of India
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#64748B]">
              From Kashmir to Kanyakumari — engineered PLA+ and PETG prints packed
              safely for every doorstep.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EBF5F5] text-[#1F6E72] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#111827]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
