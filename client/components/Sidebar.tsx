"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  LayoutDashboard,
  Megaphone,
  Bot,
  Plus,
  Star,
  Building2,
} from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import RegisterModal from "./RegisterModal";
import Skeleton from "./common/Skeleton";
import { Button } from "./ui";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { campaigns, isLoading } = useCampaigns();
  const [showModal, setShowModal] = useState(false);

  // Get current active campaign id if inside /campaign/[id]
  const currentCampaignId = pathname.startsWith("/campaign/")
    ? pathname.split("/")[2]
    : campaigns[0]?.content_id || "";
  
  const currentCampaign = campaigns.find((c) => c.content_id === currentCampaignId) || campaigns[0];
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <div className="w-64 bg-[#141416] border-r border-[#202023] flex flex-col h-screen shrink-0 text-sm font-sans select-none text-zinc-300">
      {/* Top Header */}
      <div className="p-4 border-b border-[#202023]">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition group">
          <ChevronLeft className="h-4 w-4 text-zinc-400 group-hover:text-zinc-100" />
          <div>
            <div className="font-bold text-sm text-zinc-100 leading-none">StudioOracle</div>
            <div className="text-[11px] text-zinc-500 pt-0.5">Return to launchpad</div>
          </div>
        </Link>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Section: Campaign Intelligence */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 px-3 uppercase tracking-wider block mb-1">
            Intelligence
          </span>

          {[
            { tabId: "overview", label: "Dashboard", icon: LayoutDashboard },
            { tabId: "marketing", label: "Marketing", icon: Megaphone },
            { tabId: "agent", label: "Assistant", icon: Bot },
          ].map((item) => {
            const isTabActive = pathname.startsWith("/campaign/") && currentTab === item.tabId;
            const targetUrl = currentCampaign ? `/campaign/${currentCampaign.content_id}?tab=${item.tabId}` : "/";
            const Icon = item.icon;

            return (
              <Link
                key={item.tabId}
                href={targetUrl}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isTabActive
                    ? "bg-[#242428] text-white font-semibold shadow-xs"
                    : "text-zinc-300 hover:text-white hover:bg-[#1a1a1d]"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Section: Campaigns List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3.5 mb-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Campaigns
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowModal(true)}
              title="Add Campaign"
              className="text-zinc-400 hover:text-zinc-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2 px-1">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              campaigns.map((c) => {
                const isSelected = currentCampaign?.content_id === c.content_id;
                return (
                  <Link
                    key={c.content_id}
                    href={`/campaign/${c.content_id}?tab=${currentTab}`}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition ${
                      isSelected
                        ? "bg-[#222227] text-white font-bold border border-[#323238] shadow-xs"
                        : "text-zinc-200 hover:text-white hover:bg-[#1a1a1d] font-medium"
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        c.status === "active" ? "bg-[#4ade80] shadow-[0_0_6px_#4ade80]" : "bg-zinc-600"
                      }`}
                    />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mx-1 bg-[#1a1a16] border border-[#3b3a1a] rounded-xl p-3.5 space-y-1 text-xs">
          <div className="flex items-start gap-2">
            <Star className="h-3.5 w-3.5 text-[#e6fc4f] shrink-0 mt-0.5 fill-[#e6fc4f]" />
            <div className="space-y-0.5 text-zinc-200">
              <span className="font-semibold text-zinc-100 block text-[11px]">
                ClickHouse Ingestion
              </span>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Live audience telemetry synced across YouTube & Reddit.
              </p>
            </div>
          </div>
        </div>

        {/* Organization / Workspace Section */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 px-3 uppercase tracking-wider block mb-1">
            Organization
          </span>
          <div className="flex items-center justify-between px-3.5 py-2.5 text-xs text-zinc-300 bg-[#1a1a1d] rounded-lg border border-[#232326]">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-semibold">StudioOracle</span>
            </div>
            <span className="text-[10px] text-[#e6fc4f] font-mono font-semibold">Pro Tier</span>
          </div>
        </div>
      </div>

      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          onSuccess={(contentId) => {
            router.push(`/campaign/${contentId}?tab=overview`);
          }}
        />
      )}
    </div>
  );
}
