"use client";

import React, { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, rightElement, className = "", id, required, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 font-sans w-full text-left">
        {label && (
          <div className="flex items-center justify-between min-h-[18px]">
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider select-none"
            >
              {label} {required && <span className="text-amber-400">*</span>}
            </label>
            {rightElement}
          </div>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          className={`w-full bg-[#141416] border ${
            error ? "border-rose-500" : "border-[#28282b]"
          } rounded-lg p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#e6fc4f] transition font-sans resize-none ${className}`}
          {...props}
        />

        {error && <p className="text-xs text-rose-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-400 leading-tight">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
