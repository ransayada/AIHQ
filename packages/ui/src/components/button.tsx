"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-purple)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-studio-900)] disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-accent-purple)] text-white hover:bg-[var(--color-accent-purple-dim)] active:scale-95",
        ghost:
          "bg-transparent text-[var(--color-studio-100)] hover:bg-[var(--color-studio-600)] hover:text-white active:scale-95",
        outline:
          "border border-[var(--color-studio-400)] bg-transparent text-[var(--color-studio-100)] hover:bg-[var(--color-studio-600)] hover:border-[var(--color-studio-300)] active:scale-95",
        destructive:
          "bg-[var(--color-accent-red)] text-white hover:opacity-80 active:scale-95",
        transport:
          "bg-[var(--color-studio-600)] border border-[var(--color-studio-400)] text-[var(--color-studio-100)] hover:bg-[var(--color-studio-500)] hover:border-[var(--color-studio-300)] active:scale-95",
        "transport-active":
          "bg-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)] text-[var(--color-studio-900)] hover:opacity-90 active:scale-95",
      },
      size: {
        xs: "h-6 px-2 text-xs rounded-[var(--radius-control)]",
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-10 px-4 text-base",
        icon: "h-8 w-8 p-0",
        "icon-sm": "h-6 w-6 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
