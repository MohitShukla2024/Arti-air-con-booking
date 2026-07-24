import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "white" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    const variants = {
      primary:
        "primary-gradient text-white shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-full",
      secondary:
        "border-2 border-[#0050cb] text-[#0050cb] hover:bg-[#dae1ff]/20 rounded-full",
      outline:
        "border border-[#c2c6d8] bg-white text-[#191c1e] hover:bg-[#f2f4f6] rounded-xl",
      white:
        "bg-white text-[#0050cb] shadow-lg hover:shadow-xl hover:bg-white/90 rounded-full",
      ghost: "text-[#0050cb] hover:bg-[#0066ff]/10 rounded-xl",
      danger:
        "border-2 border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/20 rounded-full",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
      icon: "p-2.5 rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
