"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = "", id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 font-sans w-full text-left">
        {label && (
          <div className="flex items-center justify-between min-h-[18px]">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider select-none"
            >
              {label} {required && <span className="text-amber-400">*</span>}
            </label>
            {rightElement}
          </div>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`w-full h-11 bg-[#141416] border ${
              error ? "border-rose-500" : "border-[#28282b]"
            } rounded-lg px-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#e6fc4f] transition font-sans ${
              leftIcon ? "pl-10" : ""
            } ${className}`}
            {...props}
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-400 leading-tight">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
