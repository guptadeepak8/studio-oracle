"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Movie, Comment, IngestResponse, CampaignDecisionsResponse } from "../../utils/types";
import { API_ENDPOINTS, API_BASE_URL } from "../../utils/constants";
import { DropItem } from "../../components/TrailerComparison";
import { apiRequest } from "../../utils/apiClient";
import { CAMPAIGNS_QUERY_KEY } from "./useCampaignsQueries";

export const campaignDetailKeys = {
  all: (id: string) => ["campaign", id] as const,
  detail: (id: string) => ["campaign", id, "detail"] as const,
  comments: (id: string) => ["campaign", id, "comments"] as const,
  analytics: (id: string) => ["campaign", id, "analytics"] as const,
  drops: (id: string) => ["campaign", id, "drops"] as const,
  pulse: (id: string) => ["campaign", id, "pulse"] as const,
  decisions: (id: string) => ["campaign", id, "decisions"] as const,
};

export function useCampaignQuery(campaignId: string) {
  return useQuery({
    queryKey: campaignDetailKeys.detail(campaignId),
    queryFn: async () => {
      const movies = await apiRequest<Movie[]>(API_ENDPOINTS.MOVIES, { suppressErrorToast: true });
      return movies.find((m) => m.content_id === campaignId) || null;
    },
    enabled: Boolean(campaignId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCommentsQuery(campaignId: string) {
  return useQuery({
    queryKey: campaignDetailKeys.comments(campaignId),
    queryFn: () => apiRequest<Comment[]>(API_ENDPOINTS.COMMENTS(campaignId), { suppressErrorToast: true }),
    enabled: Boolean(campaignId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}

export function useAnalyticsQuery(campaignId: string) {
  return useQuery({
    queryKey: campaignDetailKeys.analytics(campaignId),
    queryFn: () => apiRequest(API_ENDPOINTS.ANALYTICS(campaignId), { suppressErrorToast: true }),
    enabled: Boolean(campaignId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}

export function useDropsQuery(campaignId: string) {
  return useQuery({
    queryKey: campaignDetailKeys.drops(campaignId),
    queryFn: () => apiRequest<DropItem[]>(API_ENDPOINTS.DROPS(campaignId), { suppressErrorToast: true }),
    enabled: Boolean(campaignId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}

export function usePulseQuery(campaignId: string) {
  return useQuery({
    queryKey: campaignDetailKeys.pulse(campaignId),
    queryFn: () => apiRequest(API_ENDPOINTS.PULSE(campaignId), { suppressErrorToast: true }),
    enabled: Boolean(campaignId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}

export function useDecisionsQuery(campaignId: string) {
  return useQuery({
    queryKey: campaignDetailKeys.decisions(campaignId),
    queryFn: () =>
      apiRequest<CampaignDecisionsResponse>(`${API_BASE_URL}/api/campaigns/${campaignId}/decisions`, {
        suppressErrorToast: true,
      }),
    enabled: Boolean(campaignId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}

export function useInvestigateDecisionsMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiRequest<{ status: string; message: string; data: CampaignDecisionsResponse }>(
        `${API_BASE_URL}/api/campaigns/${campaignId}/decisions/investigate`,
        { method: "POST" }
      );
    },
    onSuccess: () => {
      toast.success("Marketing recommendations updated.");
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.decisions(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.all(campaignId) });
    },
  });
}

export function useIngestYouTubeMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      query,
      limit = 3,
      maxComments = 1000,
    }: {
      query: string;
      limit?: number;
      maxComments?: number;
    }) => {
      return apiRequest<IngestResponse>(API_ENDPOINTS.INGEST, {
        method: "POST",
        body: JSON.stringify({
          content_id: campaignId,
          query,
          limit,
          max_comments: maxComments,
        }),
      });
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(`Successfully synced ${data.ingested_comments} comments.`);
        queryClient.invalidateQueries({ queryKey: campaignDetailKeys.all(campaignId) });
        queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
      } else {
        toast.error(`Sync notice: ${data.message || "Unknown error"}`);
      }
    },
  });
}

export function useGroundGoogleSearchMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (query?: string) => {
      return apiRequest<{ status: string; message: string }>(
        `${API_BASE_URL}/api/campaigns/${campaignId}/ingest-web-grounding`,
        {
          method: "POST",
          body: JSON.stringify({ query }),
        }
      );
    },
    onSuccess: (data) => {
      toast.success(data.message || "Press and review articles indexed.");
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.all(campaignId) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(`Google Search Grounding error: ${error.message}`);
    },
  });
}
