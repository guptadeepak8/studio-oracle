"use client";

import React from "react";
import Skeleton from "../common/Skeleton";

export default function CampaignCardSkeleton() {
  return (
    <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-6 flex flex-col justify-between gap-5 shadow-xs animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>

        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      <div className="pt-3 border-t border-[#28282b]/80 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
