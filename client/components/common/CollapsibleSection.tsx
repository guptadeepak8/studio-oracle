"use client";

import React, { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  headerAction,
  children,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-base font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
        >
          {isOpen ? (
            <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4.5 w-4.5 text-zinc-400" />
          )}
          <span>{title}</span>
        </button>

        {headerAction && <div>{headerAction}</div>}
      </div>

      {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}

      {isOpen && children}
    </div>
  );
}

