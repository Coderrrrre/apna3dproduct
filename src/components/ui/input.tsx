import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex min-h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm text-[#111827] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:border-[#1F6E72] focus-visible:ring-2 focus-visible:ring-[#1F6E72]/20 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
