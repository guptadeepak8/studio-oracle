"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Movie } from "../../utils/types";
import { API_ENDPOINTS } from "../../utils/constants";
import { apiRequest } from "../../utils/apiClient";
import { CreateCampaignPayload } from "../useCampaigns";

export const CAMPAIGNS_QUERY_KEY = ["campaigns"] as const;

export function useCampaignsQuery() {
  return useQuery({
    queryKey: CAMPAIGNS_QUERY_KEY,
    queryFn: () => apiRequest<Movie[]>(API_ENDPOINTS.MOVIES, { suppressErrorToast: true }),
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
  });
}

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCampaignPayload) => {
      return apiRequest<{ status: string; content_id: string; title: string }>(
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
    },
    onSuccess: (data, variables) => {
      toast.success(`"${variables.title}" launched! Initial comment ingestion started in background.`);
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
    },
  });
}

export function useUpdateCampaignStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      status,
      title,
    }: {
      contentId: string;
      status: "active" | "stopped";
      title?: string;
    }) => {
      return apiRequest(API_ENDPOINTS.CAMPAIGN_STATUS(contentId), {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (_, variables) => {
      if (variables.status === "active") {
        toast.success(`Live tracking resumed${variables.title ? ` for "${variables.title}"` : ""}.`);
      } else {
        toast.info(`Live tracking paused${variables.title ? ` for "${variables.title}"` : ""}.`);
      }
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["campaign", variables.contentId] });
    },
  });
}

export function useDeleteCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, title }: { contentId: string; title?: string }) => {
      return apiRequest(API_ENDPOINTS.DELETE_CAMPAIGN(contentId), {
        method: "DELETE",
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`"${variables.title || "Campaign"}" deleted and ClickHouse audience records purged.`);
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: ["campaign", variables.contentId] });
    },
  });
}

