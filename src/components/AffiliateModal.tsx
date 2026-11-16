import React, { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [upiOrEmail, setUpiOrEmail] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix =
      name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 5) || 'CREATOR';
    const suffix = Math.floor(10 + Math.random() * 89);
    setReferralCode(`${prefix}5X${suffix}`);
  };

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard
      ?.writeText(`https://apna3dshop.in/?ref=${referralCode}`)
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="bg-[#0B1727] text-white border-b-0">
          <span className="text-xs font-semibold text-[#9BBEC0] uppercase tracking-wider">
            Apna3DShop Partner Program
          </span>
          <DialogTitle className="text-white text-xl">
            Earn 5% on every order you refer
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-xs">
            Instant UPI payout code for creators &amp; auto clubs
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {referralCode ? (
            <div className="space-y-4">
              <div className="rounded-[12px] bg-[#EBF5F5] border border-[#9BBEC0] p-4">
                <span className="text-xs font-semibold text-[#1F6E72] block">
                  Your Instant Referral Link
                </span>
                <p className="font-mono text-sm font-bold text-[#111827] mt-1 break-all">
                  https://apna3dshop.in/?ref={referralCode}
                </p>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Share this link with friends, bike clubs, or Instagram followers.
                5% commission is credited weekly to <strong>{upiOrEmail}</strong>.
              </p>
              <Button type="button" onClick={handleCopy} className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Referral Link</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4">
              <p className="text-sm text-[#64748B]">
                Join creators, auto enthusiasts, and gifting pages earning flat 5%
                UPI payouts on every custom keychain and lamp order.
              </p>
              <div>
                <label
                  htmlFor="affiliate-name"
                  className="block text-xs font-semibold text-[#111827] mb-1.5"
                >
                  Your Name or Handle
                </label>
                <Input
                  id="affiliate-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. KabirPrints"
                />
              </div>
              <div>
                <label
                  htmlFor="affiliate-payout"
                  className="block text-xs font-semibold text-[#111827] mb-1.5"
                >
                  UPI ID or Email for Payouts
                </label>
                <Input
                  id="affiliate-payout"
                  type="text"
                  required
                  value={upiOrEmail}
                  onChange={(e) => setUpiOrEmail(e.target.value)}
                  placeholder="e.g. kabir@okaxis"
                />
              </div>
              <Button type="submit" className="w-full">
                <Share2 className="w-4 h-4" />
                <span>Generate Affiliate Link</span>
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
