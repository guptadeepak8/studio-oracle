"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  LayoutDashboard,
  Megaphone,
  Bot,
  Database,
  Radio,
  Plus,
  Star,
  ExternalLink,
  ChevronDown,
  Building2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { API_ENDPOINTS } from "../utils/constants";
import { Movie } from "../utils/types";
import RegisterModal from "./RegisterModal";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("movie");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MOVIES);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (e) {
      console.error("Error fetching campaigns in sidebar:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const handleRefresh = () => fetchCampaigns();
    window.addEventListener("refresh-campaigns", handleRefresh);
    return () => window.removeEventListener("refresh-campaigns", handleRefresh);
  }, []);

  const handleRegisterCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsRegistering(true);
    try {
      const response = await fetch(API_ENDPOINTS.CAMPAIGNS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content_type: newType,
          description: newDesc,
          release_date: newReleaseDate || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setNewTitle("");
        setNewDesc("");
        setNewReleaseDate("");
        setShowModal(false);
        
        window.dispatchEvent(new Event("refresh-campaigns"));
        router.push(`/campaign/${result.content_id}?tab=overview`);
      } else {
        alert("Failed to register campaign.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to campaign registration server.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Get current active campaign id if inside /campaign/[id]
  const currentCampaignId = pathname.startsWith("/campaign/")
    ? pathname.split("/")[2]
    : campaigns[0]?.content_id || "";
  
  const currentCampaign = campaigns.find(c => c.content_id === currentCampaignId) || campaigns[0];
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <div className="w-64 bg-[#141416] border-r border-[#202023] flex flex-col h-screen shrink-0 text-sm font-sans select-none text-zinc-300">
      {/* Top Header matching screenshot */}
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
            { tabId: "overview", label: "Executive Dashboard", icon: LayoutDashboard },
            { tabId: "marketing", label: "Marketing Action Plan", icon: Megaphone },
            { tabId: "agent", label: "AI Research Assistant", icon: Bot },
          ].map((item) => {
            const isTabActive = pathname.startsWith("/campaign/") && currentTab === item.tabId;
            const targetUrl = currentCampaign ? `/campaign/${currentCampaign.content_id}?tab=${item.tabId}` : "/";
            const Icon = item.icon;

            return (
              <Link
                key={item.tabId}
                href={targetUrl}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isTabActive
                    ? "bg-[#242428] text-white font-semibold shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1d]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Section: Campaigns List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Campaigns
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="text-zinc-400 hover:text-zinc-100 p-0.5 rounded hover:bg-zinc-800 transition cursor-pointer"
              title="Add Campaign"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {campaigns.map((c) => {
              const isSelected = currentCampaign?.content_id === c.content_id;
              return (
                <Link
                  key={c.content_id}
                  href={`/campaign/${c.content_id}?tab=${currentTab}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-[#222227] text-white font-bold border border-[#323238] shadow-xs"
                      : "text-zinc-200 hover:text-white hover:bg-[#1a1a1d] font-medium"
                  }`}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    c.status === "active" ? "bg-[#4ade80] shadow-[0_0_6px_#4ade80]" : "bg-zinc-600"
                  }`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Gold Callout Card matching screenshot */}
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
          <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-300 bg-[#1a1a1d] rounded-lg border border-[#232326]">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-semibold">StudioOracle</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Footer Links matching screenshot without all systems operational */}
      <div className="p-3 border-t border-[#202023] space-y-1 text-xs text-zinc-400">
        <a
          href="https://clickhouse.com/cloud"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#1a1a1d] hover:text-zinc-200 transition"
        >
          <span>ClickHouse Cloud</span>
          <ExternalLink className="h-3 w-3 text-zinc-500" />
        </a>
        <a
          href="https://ai.google.dev"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#1a1a1d] hover:text-zinc-200 transition"
        >
          <span>Gemini 2.5 Flash</span>
          <ExternalLink className="h-3 w-3 text-zinc-500" />
        </a>
      </div>

      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          onSubmit={handleRegisterCampaign}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newDesc={newDesc}
          setNewDesc={setNewDesc}
          newType={newType}
          setNewType={setNewType}
          newReleaseDate={newReleaseDate}
          setNewReleaseDate={setNewReleaseDate}
          isRegistering={isRegistering}
        />
      )}
    </div>
  );
}
