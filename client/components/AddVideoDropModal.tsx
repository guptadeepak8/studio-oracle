"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Video, Search, Loader2, Play, Film, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "../utils/constants";
import { Button, Input } from "./ui";
import IngestProgressModal from "./IngestProgressModal";
import { useQueryClient } from "@tanstack/react-query";
import { campaignDetailKeys } from "../hooks/queries/useCampaignDetailQueries";

interface AddVideoDropModalProps {
  contentId: string;
  campaignTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface YouTubeTrailerResult {
  video_id: string;
  title: string;
  channel_title: string;
  description: string;
  published_at: string;
  thumbnail_url: string;
  url: string;
}

export default function AddVideoDropModal({
  contentId,
  campaignTitle,
  onClose,
  onSuccess,
}: AddVideoDropModalProps) {
  const queryClient = useQueryClient();
  const [videoQuery, setVideoQuery] = useState("");
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [youtubeResults, setYoutubeResults] = useState<YouTubeTrailerResult[]>([]);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced live YouTube trailer search
  useEffect(() => {
    const queryToSearch = videoQuery.trim();
    if (!queryToSearch || queryToSearch.length < 2) {
      setYoutubeResults([]);
      setShowDropdown(false);
      return;
    }

    // Direct YouTube link
    if (
      queryToSearch.includes("youtube.com/watch") ||
      queryToSearch.includes("youtu.be/") ||
      queryToSearch.includes("youtube.com/embed")
    ) {
      setSelectedVideoUrl(queryToSearch);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingYouTube(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/youtube/search-trailers?q=${encodeURIComponent(
            `${campaignTitle} ${queryToSearch}`
          )}&limit=5`
        );
        if (res.ok) {
          const data: YouTubeTrailerResult[] = await res.json();
          setYoutubeResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.warn("YouTube search error:", err);
      } finally {
        setIsSearchingYouTube(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [videoQuery, campaignTitle]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectVideo = (result: YouTubeTrailerResult) => {
    setSelectedVideoUrl(result.url);
    setVideoTitle(result.title);
    setVideoQuery(result.title);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTarget = selectedVideoUrl.trim() || videoQuery.trim();

    if (!finalTarget) {
      toast.error("Please enter a YouTube video URL or search query.");
      return;
    }

    setIsSubmitting(true);
    setShowProgressModal(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: contentId,
          query: finalTarget,
          limit: 1,
          max_comments: 1000,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to ingest video drop.");
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.all(contentId) });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("New video drop added successfully!");

      setTimeout(() => {
        setIsSubmitting(false);
        setShowProgressModal(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      setShowProgressModal(false);
      toast.error(err.message || "Failed to add video drop.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
        <div className="bg-[#141416] border border-[#28282b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#222226] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-100">Add New Video Drop</h3>
                <p className="text-xs text-zinc-400">
                  Track a new trailer, teaser, or clip for <strong className="text-zinc-200">{campaignTitle}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Video Search / Link Input */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Video Link or Search Term
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Paste YouTube link or type e.g. Official Trailer 2..."
                  value={videoQuery}
                  onChange={(e) => {
                    setVideoQuery(e.target.value);
                    setSelectedVideoUrl(e.target.value);
                  }}
                  leftIcon={
                    isSearchingYouTube ? (
                      <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 text-zinc-400" />
                    )
                  }
                  required
                />
              </div>

              {/* YouTube Autocomplete Dropdown */}
              {showDropdown && youtubeResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#18181b] border border-[#2a2a2e] rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-[#222226]">
                  {youtubeResults.map((res) => (
                    <div
                      key={res.video_id}
                      onClick={() => handleSelectVideo(res)}
                      className="p-3 hover:bg-[#222226] flex items-center gap-3 cursor-pointer transition"
                    >
                      {res.thumbnail_url ? (
                        <img
                          src={res.thumbnail_url}
                          alt={res.title}
                          className="w-16 h-10 object-cover rounded-md border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-zinc-800 rounded-md flex items-center justify-center shrink-0">
                          <Play className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-semibold text-zinc-200 truncate">{res.title}</p>
                        <p className="text-[11px] text-zinc-400">{res.channel_title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ingestion Info Box */}
            <div className="bg-[#18181b] border border-[#28282b] p-3.5 rounded-xl text-xs text-zinc-300 space-y-1">
              <span className="font-bold text-[11px] text-indigo-400 uppercase tracking-wider block">
                Automatic Milestone Comparison
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Adding this video will automatically index verified comments, calculate positive/negative reception, and unlock side-by-side milestone comparison.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#222226]">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Video Drop
              </Button>
            </div>
          </form>
        </div>
      </div>

      {showProgressModal && (
        <IngestProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          targetQuery={campaignTitle}
          source="youtube"
        />
      )}
    </>
  );
}
