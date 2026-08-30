"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
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
    <div className="w-[18%] border-r border-[#1a1a1f] bg-[#0a0a0c] flex flex-col h-screen shrink-0 text-sm">
      <div className="p-5 border-b border-[#1a1a1f] flex items-center justify-between">
        <Link href="/" className="font-semibold text-sm tracking-widest uppercase text-zinc-300 hover:text-zinc-100 transition">
          StudioOracle
        </Link>
      </div>

      <div className="p-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-1.5 bg-[#131316] hover:bg-[#1a1a1f] border border-[#232329] text-zinc-200 py-1.5 rounded transition text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-amber-500" />
          New Campaign
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">
          Campaigns
        </span>

        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            Loading...
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => {
              const url = `/campaign/${c.content_id}`;
              const isActive = pathname.startsWith(url);
              const currentTab = searchParams.get("tab") || "overview";

              return (
                <div key={c.content_id} className="space-y-1">
                  <Link
                    href={`${url}?tab=overview`}
                    className={`flex items-center justify-between px-3 py-1.5 rounded transition text-xs font-medium ${
                      isActive
                        ? "bg-[#131316] text-zinc-100 font-semibold"
                        : "text-zinc-400 hover:bg-[#131316]/50 hover:text-zinc-200"
                    }`}
                  >
                    <span className="truncate pr-2 block">{c.title}</span>
                    <span className={`h-1 w-1 rounded-full shrink-0 ${
                      c.status === "active" 
                        ? "bg-emerald-500" 
                        : c.status === "collecting"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-rose-500"
                    }`} />
                  </Link>

                  {isActive && (
                    <div className="pl-3.5 py-0.5 space-y-0.5 border-l border-[#1a1a1f] ml-4 mt-0.5">
                      {[
                        { tabId: "overview", label: "Overview" },
                        { tabId: "intelligence", label: "Intelligence" },
                        { tabId: "evidence", label: "Evidence" },
                        { tabId: "agent", label: "Agent" }
                      ].map((subItem) => {
                        const isSubActive = currentTab === subItem.tabId;
                        return (
                          <Link
                            key={subItem.tabId}
                            href={`${url}?tab=${subItem.tabId}`}
                            className={`flex items-center px-2 py-1 rounded text-[11px] transition ${
                              isSubActive
                                ? "text-amber-500 font-semibold border-l border-amber-500 -ml-[15px] pl-[14px] bg-transparent"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {subItem.label}
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

      <div className="p-4 border-t border-[#1a1a1f] bg-black/10 text-[9px] text-zinc-600 text-center font-semibold tracking-wider uppercase">
        <span>Research Console v1.3</span>
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
