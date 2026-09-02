"use client";

import React from "react";

export type StatusBadgeVariant = "active" | "stopped" | "positive" | "negative" | "info" | "warning";

interface StatusBadgeProps {
  status?: string;
  variant?: StatusBadgeVariant;
  label?: string;
  pulsing?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  variant,
  label,
  pulsing,
  className = "",
}: StatusBadgeProps) {
  // Determine variant based on status string if not explicitly passed
  let resolvedVariant: StatusBadgeVariant = variant || "info";
  let resolvedLabel = label || status || "";

  if (!variant && status) {
    if (status === "active") {
      resolvedVariant = "active";
      resolvedLabel = label || "Active Tracking";
    } else if (status === "stopped") {
      resolvedVariant = "stopped";
      resolvedLabel = label || "Paused";
    } else if (status === "collecting") {
      resolvedVariant = "active";
      resolvedLabel = label || "Collecting";
    }
  }

  const variantStyles: Record<StatusBadgeVariant, string> = {
    active: "bg-[#183424] text-[#4ade80] border-[#234e35]",
    stopped: "bg-zinc-800/80 text-zinc-400 border-zinc-700",
    positive: "bg-[#183424] text-[#4ade80] border-[#234e35]",
    negative: "bg-[#331b20] text-[#f87171] border-[#4c242a]",
    info: "bg-[#1e293b] text-[#60a5fa] border-[#334155]",
    warning: "bg-amber-950/40 text-amber-400 border-amber-800/60",
  };

  const dotColors: Record<StatusBadgeVariant, string> = {
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
        variantStyles[resolvedVariant]
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotColors[resolvedVariant]} ${
          pulsing || resolvedVariant === "active" ? "animate-pulse" : ""
        }`}
      />
      <span>{resolvedLabel}</span>
    </span>
  );
}

