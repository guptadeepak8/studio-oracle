"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Movie, Comment, IngestResponse } from "../utils/types";
import { API_ENDPOINTS, API_BASE_URL } from "../utils/constants";
import { SentimentStats, ThemeItem, ConflictItem } from "../utils/analytics";
import { apiRequest } from "../utils/apiClient";
import { DropItem } from "../components/TrailerComparison";

const DEFAULT_SENTIMENT: SentimentStats = {
  positive: 0,
  negative: 0,
  neutral: 0,
  posPercent: 0,
  negPercent: 0,
};

export function useCampaignDetail(campaignId: string) {
  const [campaign, setCampaign] = useState<Movie | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const [sentiment, setSentiment] = useState<SentimentStats>(DEFAULT_SENTIMENT);
  const [themeStats, setThemeStats] = useState<ThemeItem[]>([]);
  const [conflictingSignals, setConflictingSignals] = useState<ConflictItem[]>([]);
  const [platforms, setPlatforms] = useState<Record<string, any>>({});
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [pulseSummary, setPulseSummary] = useState("Loading audience summary...");

  const [isIngesting, setIsIngesting] = useState(false);
  const [isIngestingReddit, setIsIngestingReddit] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const movies = await apiRequest<Movie[]>(API_ENDPOINTS.MOVIES, { suppressErrorToast: true });
      const found = movies.find((m) => m.content_id === campaignId);
      if (found) {
        setCampaign(found);
      }
    } catch (err) {
      console.error("Error fetching campaign detail:", err);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, [campaignId]);

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const data = await apiRequest<Comment[]>(API_ENDPOINTS.COMMENTS(campaignId), { suppressErrorToast: true });
      setComments(data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [campaignId]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [analyticsData, dropsData, pulseData] = await Promise.all([
        apiRequest(API_ENDPOINTS.ANALYTICS(campaignId), { suppressErrorToast: true }).catch(() => null),
        apiRequest(API_ENDPOINTS.DROPS(campaignId), { suppressErrorToast: true }).catch(() => []),
        apiRequest(API_ENDPOINTS.PULSE(campaignId), { suppressErrorToast: true }).catch(() => null),
      ]);

      if (analyticsData) {
        setSentiment(analyticsData.sentiment || DEFAULT_SENTIMENT);
        setThemeStats(analyticsData.themes || []);
        setConflictingSignals(analyticsData.conflicts || []);
        setPlatforms(analyticsData.platforms || {});
      }

      if (dropsData) {
        setDrops(dropsData);
      }

      if (pulseData) {
        setPulseSummary(pulseData.pulseSummary || "Audience metrics show healthy engagement across key themes.");
      }
    } catch (err) {
      console.error("Error fetching analytics bundle:", err);
    }
  }, [campaignId]);

  const refreshAll = useCallback(() => {
    fetchCampaign();
    fetchComments();
    fetchAnalytics();
  }, [fetchCampaign, fetchComments, fetchAnalytics]);

  useEffect(() => {
    if (campaignId) {
      refreshAll();
    }
  }, [campaignId, refreshAll]);

  const triggerIngest = async (query: string, limit: number = 3, maxComments: number = 1000): Promise<IngestResponse | null> => {
    setIsIngesting(true);
    try {
      const data = await apiRequest<IngestResponse>(API_ENDPOINTS.INGEST, {
        method: "POST",
        body: JSON.stringify({
          content_id: campaignId,
          query: query || campaign?.title,
          limit,
          max_comments: maxComments,
        }),
      });

      if (data.status === "success") {
        toast.success(`Successfully synced ${data.ingested_comments} comments from YouTube!`);
        refreshAll();
        return data;
      } else {
        toast.error(`Sync failed: ${data.message || "Unknown error"}`);
        return null;
      }
    } catch (err) {
      console.error("Error triggering ingestion:", err);
      return null;
    } finally {
      setIsIngesting(false);
    }
  };

  const triggerReddit = async (query?: string): Promise<boolean> => {
    setIsIngestingReddit(true);
    try {
      const res = await apiRequest<{ status: string; message: string }>(
        `${API_BASE_URL}/api/campaigns/${campaignId}/ingest-reddit`,
        {
          method: "POST",
          body: JSON.stringify({ query: query || campaign?.title }),
        }
      );

      toast.success(res.message || "Successfully synced Reddit community discussions!");
      refreshAll();
      return true;
    } catch (err) {
      console.error("Error syncing Reddit:", err);
      return false;
    } finally {
      setIsIngestingReddit(false);
    }
  };

  return {
    campaign,
    setCampaign,
    isLoadingCampaign,
    comments,
    isLoadingComments,
    sentiment,
    themeStats,
    conflictingSignals,
    platforms,
    drops,
    pulseSummary,
    isIngesting,
    isIngestingReddit,
    refreshAll,
    triggerIngest,
    triggerReddit,
  };
}
