"use client";

import React, { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui";

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          leftIcon={
            isOpen ? (
              <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />
            ) : (
              <ChevronRight className="h-4.5 w-4.5 text-zinc-400" />
            )
          }
          className="text-base font-bold text-zinc-100 hover:text-indigo-400 px-0 hover:bg-transparent"
        >
          {title}
        </Button>

        {headerAction && <div>{headerAction}</div>}
      </div>

      {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}

      {isOpen && children}
    </div>
  );
}
