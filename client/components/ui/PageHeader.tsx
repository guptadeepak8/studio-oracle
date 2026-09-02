"use client";

import React, { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  badge,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between border-b border-[#202023] pb-4 flex-wrap gap-4 font-sans ${className}`}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-xl text-zinc-100 tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-zinc-400">{description}</p>}
      </div>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}

