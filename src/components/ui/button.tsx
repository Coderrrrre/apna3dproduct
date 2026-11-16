import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors cursor-pointer disabled:pointer-events-none disabled:bg-[#9BBEC0] disabled:text-white focus-visible:outline-2 focus-visible:outline-[#1F6E72] focus-visible:outline-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[#1F6E72] text-white hover:bg-[#165356]',
        destructive: 'bg-[#C8232C] text-white hover:bg-[#a61b23]',
        outline:
          'border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFC] hover:border-[#1F6E72]',
        secondary: 'bg-[#F8FAFC] text-[#111827] hover:bg-[#EBF5F5]',
        ghost: 'text-[#111827] hover:bg-[#F8FAFC] hover:text-[#1F6E72]',
        link: 'text-[#1F6E72] underline-offset-4 hover:underline',
        whatsapp: 'bg-[#25D366] text-white hover:bg-[#1FB858]',
      },
      size: {
        default: 'min-h-[44px] px-5 py-2.5',
        sm: 'min-h-[38px] px-3.5 py-2 text-xs',
        lg: 'min-h-[48px] px-6 py-3 text-base',
        icon: 'min-w-[44px] min-h-[44px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
