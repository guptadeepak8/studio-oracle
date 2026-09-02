"use client";

import React from "react";

export type BadgeVariant = "active" | "stopped" | "positive" | "negative" | "info" | "warning" | "default";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulsing?: boolean;
}

export function Badge({
  variant = "default",
  pulsing = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-[#242428] text-zinc-300 border-[#323238]",
    active: "bg-[#183424] text-[#4ade80] border-[#234e35]",
    stopped: "bg-zinc-800/80 text-zinc-400 border-zinc-700",
    positive: "bg-[#183424] text-[#4ade80] border-[#234e35]",
    negative: "bg-[#331b20] text-[#f87171] border-[#4c242a]",
    info: "bg-[#1e293b] text-[#60a5fa] border-[#334155]",
    warning: "bg-amber-950/40 text-amber-400 border-amber-800/60",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-zinc-400",
    active: "bg-[#4ade80]",
    stopped: "bg-zinc-500",
    positive: "bg-[#4ade80]",
    negative: "bg-[#f87171]",
    info: "bg-[#60a5fa]",
    warning: "bg-amber-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
        variantStyles[variant]
      } ${className}`}
      {...props}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} ${
          pulsing || variant === "active" ? "animate-pulse" : ""
        }`}
      />
      <span>{children}</span>
    </span>
  );
}

