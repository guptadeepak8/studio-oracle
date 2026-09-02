"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Movie } from "../utils/types";
import { API_ENDPOINTS } from "../utils/constants";
import { apiRequest } from "../utils/apiClient";

export interface CreateCampaignPayload {
  title: string;
  content_type?: string;
  description?: string;
  release_date?: string | null;
  target_terms: string[];
  sync_mode?: string;
  initial_volume?: number;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await apiRequest<Movie[]>(API_ENDPOINTS.MOVIES, { suppressErrorToast: true });
      setCampaigns(data || []);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    const handleRefresh = () => fetchCampaigns();
    window.addEventListener("refresh-campaigns", handleRefresh);
    return () => window.removeEventListener("refresh-campaigns", handleRefresh);
  }, [fetchCampaigns]);

  const dispatchRefresh = () => {
    window.dispatchEvent(new Event("refresh-campaigns"));
  };

  const createCampaign = async (payload: CreateCampaignPayload): Promise<string | null> => {
    setIsCreating(true);
    try {
      const res = await apiRequest<{ status: string; content_id: string; title: string }>(
        API_ENDPOINTS.CAMPAIGNS,
        {
          method: "POST",
          body: JSON.stringify({
            title: payload.title,
            content_type: payload.content_type || "movie",
            description: payload.description || "",
            release_date: payload.release_date || null,
            target_terms: payload.target_terms,
          }),
        }
      );

      toast.success(`"${payload.title}" launched! Initial comment ingestion started in background.`);
      dispatchRefresh();
      await fetchCampaigns();
      return res.content_id;
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const updateStatus = async (contentId: string, nextStatus: "active" | "stopped", title?: string): Promise<boolean> => {
    setIsUpdatingStatus(true);
    try {
      await apiRequest(API_ENDPOINTS.CAMPAIGN_STATUS(contentId), {
        method: "POST",
        body: JSON.stringify({ status: nextStatus }),
      });

      // Optimistic local update
      setCampaigns((prev) =>
        prev.map((c) => (c.content_id === contentId ? { ...c, status: nextStatus } : c))
      );

      if (nextStatus === "active") {
        toast.success(`Live tracking resumed${title ? ` for "${title}"` : ""}.`);
      } else {
        toast.info(`Live tracking paused${title ? ` for "${title}"` : ""}.`);
      }

      dispatchRefresh();
      return true;
    } catch (err) {
      console.error("Error updating campaign status:", err);
      return false;
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteCampaign = async (contentId: string, title?: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await apiRequest(API_ENDPOINTS.DELETE_CAMPAIGN(contentId), {
        method: "DELETE",
      });

      setCampaigns((prev) => prev.filter((c) => c.content_id !== contentId));
      toast.success(`"${title || "Campaign"}" deleted and ClickHouse audience records purged.`);
      dispatchRefresh();
      return true;
    } catch (err) {
      console.error("Error deleting campaign:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    campaigns,
    isLoading,
    isCreating,
    isUpdatingStatus,
    isDeleting,
    refreshCampaigns: fetchCampaigns,
    createCampaign,
    updateStatus,
    deleteCampaign,
  };
}
