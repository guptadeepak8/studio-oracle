"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2, Sparkles, LayoutDashboard, Compass, Database, Bot, ChevronRight, Megaphone } from "lucide-react";
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

  return (
    <div className="w-64 border-r border-[#27272a] bg-[#0c0c0e] flex flex-col h-screen shrink-0 text-sm font-sans select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#27272a] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-wider uppercase text-zinc-100 group-hover:text-amber-400 transition">
            StudioOracle
          </span>
        </Link>
      </div>

      {/* New Campaign Action */}
      <div className="p-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#18181b] hover:bg-amber-600 border border-[#27272a] hover:border-amber-500 text-zinc-100 hover:text-white py-2 rounded-lg transition text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          New Campaign
        </button>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold block">
            Campaign Streams
          </span>
          <span className="text-[10px] text-zinc-500 font-mono font-semibold">
            {campaigns.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-zinc-400 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            Loading streams...
          </div>
        ) : (
          <div className="space-y-1.5">
            {campaigns.map((c) => {
              const url = `/campaign/${c.content_id}`;
              const isActive = pathname.startsWith(url);
              const currentTab = searchParams.get("tab") || "overview";

              return (
                <div key={c.content_id} className="space-y-1">
                  <Link
                    href={`${url}?tab=overview`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition text-xs font-semibold ${
                      isActive
                        ? "bg-[#18181b] text-zinc-100 border border-zinc-700/60 shadow-sm"
                        : "text-zinc-300 hover:bg-[#18181b]/50 hover:text-zinc-100"
                    }`}
                  >
                    <span className="truncate pr-2 block">{c.title}</span>
                    <span className={`h-2 w-2 rounded-full shrink-0 ${
                      c.status === "active" 
                        ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" 
                        : c.status === "collecting"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-rose-500"
                    }`} />
                  </Link>

                  {isActive && (
                    <div className="pl-3 py-1 space-y-0.5 border-l-2 border-amber-500/40 ml-4 my-1">
                      {[
                        { tabId: "overview", label: "Executive Dashboard", icon: LayoutDashboard },
                        { tabId: "marketing", label: "Marketing Action Plan", icon: Megaphone },
                        { tabId: "agent", label: "AI Research Assistant", icon: Bot }
                      ].map((subItem) => {
                        const isSubActive = currentTab === subItem.tabId;
                        const Icon = subItem.icon;
                        return (
                          <Link
                            key={subItem.tabId}
                            href={`${url}?tab=${subItem.tabId}`}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition ${
                              isSubActive
                                ? "text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#27272a] bg-[#0c0c0e] text-[10px] text-zinc-400 flex items-center justify-between font-mono font-medium">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>ClickHouse Connected</span>
        </div>
        <span className="text-zinc-500">v1.4</span>
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
