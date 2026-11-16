import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-[#1F6E72] text-white',
        sale: 'bg-[#C8232C] text-white',
        discount: 'bg-[#0E7C5B] text-white tabular-nums',
        mint: 'bg-[#EBF5F5] text-[#1F6E72]',
        outline: 'border border-[#E5E7EB] bg-white text-[#111827]',
        muted: 'bg-[#111827]/80 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
