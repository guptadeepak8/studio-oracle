"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline"
  | "chip"
  | "chip-active"
  | "menu-item"
  | "menu-item-danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

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
        "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-xs font-bold uppercase tracking-wider transition-colors",
      secondary:
        "bg-[#1f1f23] hover:bg-[#28282d] text-zinc-100 border border-[#2d2d32] shadow-xs",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-xs font-semibold",
      ghost:
        "bg-transparent hover:bg-[#242428] text-zinc-400 hover:text-zinc-100",
      outline:
        "bg-transparent border border-[#28282b] hover:border-zinc-500 text-zinc-200 hover:text-white",
      chip:
        "bg-[#161618] hover:bg-[#202024] text-zinc-400 hover:text-zinc-200 border border-[#28282b] font-semibold",
      "chip-active":
        "bg-[#242428] text-indigo-400 border border-indigo-500/40 font-semibold shadow-xs",
      "menu-item":
        "w-full justify-start text-left px-4 py-2 hover:bg-[#242428] hover:text-zinc-100 text-zinc-300 font-medium rounded-md",
      "menu-item-danger":
        "w-full justify-start text-left px-4 py-2 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-medium rounded-md",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      xs: "text-xs px-2.5 py-1 gap-1",
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5",
      icon: "h-8 w-8 p-0",
      "icon-sm": "h-7 w-7 p-0 text-xs",
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
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
