"use client";

import React from "react";
import Skeleton from "../common/Skeleton";

interface SectionCardSkeletonProps {
  type?: "table" | "cards";
}

export default function SectionCardSkeleton({ type = "cards" }: SectionCardSkeletonProps) {
  return (
    <div className="space-y-3 font-sans animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-6 w-32 rounded-lg" />
      </div>

      <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-6 shadow-xs space-y-4">
        {type === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="bg-[#161618] border border-[#28282b] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-[#28282b]/60">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
