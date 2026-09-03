"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface CinematicLoaderProps {
  title?: string;
  subtitle?: string;
}

export default function CinematicLoader({
  title = "Loading Campaign Data",
  subtitle = "Indexing comments and sentiment...",
}: CinematicLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-zinc-200">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 font-mono">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}


