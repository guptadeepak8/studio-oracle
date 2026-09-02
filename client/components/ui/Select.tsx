"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, leftIcon, className = "", id, required, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 font-sans w-full text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider"
          >
            {leftIcon && <span className="text-zinc-400">{leftIcon}</span>}
            <span>{label}</span>
            {required && <span className="text-amber-400">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            required={required}
            className={`w-full bg-[#141416] border ${
              error ? "border-rose-500" : "border-[#28282b]"
            } rounded-lg p-2.5 pr-8 text-sm text-zinc-100 focus:outline-none focus:border-[#e6fc4f] transition cursor-pointer font-sans appearance-none ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#1c1c1f] text-zinc-100">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-3 h-4 w-4 text-zinc-400 pointer-events-none" />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-400 leading-tight">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

