"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition select-none rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-[#e6fc4f] hover:bg-[#d8ed47] text-black shadow-xs font-bold uppercase tracking-wider",
      secondary:
        "bg-[#1f1f23] hover:bg-[#28282d] text-zinc-100 border border-[#2d2d32] shadow-xs",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-xs font-semibold",
      ghost:
        "bg-transparent hover:bg-[#242428] text-zinc-400 hover:text-zinc-100",
      outline:
        "bg-transparent border border-[#28282b] hover:border-zinc-500 text-zinc-200 hover:text-white",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

