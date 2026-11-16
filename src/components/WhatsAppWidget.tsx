import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ExternalLink, Phone, Send, X } from 'lucide-react';
import { Button } from './ui/button';

export const WHATSAPP_DISPLAY = '+91 93161 13422';
export const WHATSAPP_DIGITS = '919316113422';

export const WhatsAppWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    'Hi Apna3DShop! I need help with a custom 3D print order.'
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  const waUrl = `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(
    message
  )}`;

  useEffect(() => {
    if (!open || !popoverRef.current) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        popoverRef.current,
        { opacity: 0, y: 14, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.24,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        }
      );
    });

    return () => ctx.revert();
  }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="WhatsApp Workshop Support"
          className="w-[305px] sm:w-[325px] rounded-[16px] bg-white border border-[#E5E7EB] shadow-xl overflow-hidden"
        >
          <div className="bg-[#0B1727] text-white px-4 py-3.5 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold">
                Apna3DShop Workshop Help
              </h3>
              <p className="text-[11px] text-slate-300 inline-flex items-center gap-1 mt-0.5 font-mono">
                <Phone className="w-3 h-3 text-[#25D366]" aria-hidden="true" />
                <span>{WHATSAPP_DISPLAY}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close WhatsApp widget"
              className="min-w-[36px] min-h-[36px] rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 bg-[#F8FAFC]">
            <label
              htmlFor="whatsapp-msg-input"
              className="block text-xs font-semibold text-[#111827]"
            >
              Message our 3D print desk ({WHATSAPP_DISPLAY})
            </label>
            <textarea
              id="whatsapp-msg-input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-[10px] border border-[#E5E7EB] bg-white p-2.5 text-xs text-[#111827] focus:border-[#1F6E72] focus:outline-none"
            />
            <Button asChild variant="whatsapp" size="default" className="w-full">
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Floating #25D366 WhatsApp Action Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          open
            ? 'Close WhatsApp support'
            : `Chat on WhatsApp ${WHATSAPP_DISPLAY}`
        }
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1FB858] text-white shadow-lg flex items-center justify-center transition-transform duration-200 hover:scale-105 cursor-pointer"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM17.85 15.96C17.61 16.64 16.46 17.26 15.91 17.34C15.42 17.42 14.8 17.45 14.12 17.23C13.71 17.1 13.18 16.92 12.5 16.63C9.65 15.4 7.79 12.52 7.65 12.33C7.51 12.14 6.5 10.8 6.5 9.41C6.5 8.02 7.23 7.34 7.49 7.05C7.75 6.77 8.06 6.7 8.25 6.7C8.44 6.7 8.63 6.7 8.8 6.71C8.98 6.72 9.21 6.64 9.44 7.19C9.68 7.77 10.25 9.17 10.32 9.31C10.39 9.45 10.44 9.62 10.34 9.81C10.25 10 10.2 10.12 10.06 10.28C9.92 10.44 9.76 10.64 9.63 10.76C9.49 10.9 9.34 11.05 9.51 11.34C9.68 11.63 10.27 12.59 11.14 13.37C12.26 14.37 13.21 14.68 13.5 14.82C13.79 14.97 13.96 14.94 14.13 14.75C14.3 14.56 14.85 13.91 15.04 13.62C15.23 13.33 15.42 13.38 15.69 13.48C15.95 13.57 17.37 14.27 17.66 14.42C17.95 14.56 18.14 14.63 18.21 14.75C18.28 14.87 18.28 15.44 17.85 15.96Z" />
        </svg>
      </button>
    </div>
  );
};
