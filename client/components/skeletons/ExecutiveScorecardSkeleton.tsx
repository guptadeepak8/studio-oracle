"use client";

import React from "react";
import Skeleton from "../common/Skeleton";

export default function ExecutiveScorecardSkeleton() {
  return (
    <div className="space-y-4 font-sans animate-fade-in">
      {/* 5-Card Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-4.5 space-y-3 shadow-xs"
          >
            <Skeleton className="h-3.5 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Synthesis Banner Skeleton */}
      <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 flex items-start gap-4 shadow-xs">
        <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
