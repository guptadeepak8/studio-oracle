"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "../utils/constants";
import { Movie } from "../utils/types";
import RegisterModal from "./RegisterModal";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
        router.push(`/campaign/${result.content_id}`);
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
    <div className="w-[18%] border-r border-zinc-800 bg-[#0d0d0f] flex flex-col h-screen shrink-0 text-sm">
      <div className="p-4.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
        <Link href="/" className="font-bold text-base tracking-wider uppercase text-amber-500">
          StudioOracle
        </Link>
      </div>

      <div className="p-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-150 py-2 rounded-lg font-bold transition text-xs uppercase tracking-wider cursor-pointer"
        >
          <Plus className="h-4 w-4 text-amber-500" />
          New Campaign
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">
          Campaigns Workspace
        </span>

        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            Loading campaigns...
          </div>
        ) : (
          <div className="space-y-1">
            {campaigns.map((c) => {
              const url = `/campaign/${c.content_id}`;
              const isActive = pathname === url;
              return (
                <Link
                  key={c.content_id}
                  href={url}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border transition text-sm ${
                    isActive
                      ? "bg-zinc-800/80 border-amber-500/40 text-amber-400 font-semibold"
                      : "border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <span className="truncate pr-2 block">{c.title}</span>
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    c.status === "active" 
                      ? "bg-emerald-500 animate-pulse" 
                      : c.status === "collecting"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-rose-500"
                  }`} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-850 bg-black/20 text-[10px] text-zinc-500 text-center font-medium">
        <span>Audience Ops Console v1.2</span>
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

