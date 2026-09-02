"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  campaignDetailKeys,
  useCampaignQuery,
  useCommentsQuery,
  useAnalyticsQuery,
  useDropsQuery,
  usePulseQuery,
  useDecisionsQuery,
  useInvestigateDecisionsMutation,
  useIngestYouTubeMutation,
  useGroundGoogleSearchMutation,
} from "./queries/useCampaignDetailQueries";
import { CAMPAIGNS_QUERY_KEY } from "./queries/useCampaignsQueries";
import { IngestResponse } from "../utils/types";

export function useCampaignDetail(campaignId: string) {
  const queryClient = useQueryClient();

  const { data: campaign = null, isLoading: isLoadingCampaign } = useCampaignQuery(campaignId);
  const { data: comments = [], isLoading: isLoadingComments } = useCommentsQuery(campaignId);
  const { data: analyticsData } = useAnalyticsQuery(campaignId);
  const { data: drops = [] } = useDropsQuery(campaignId);
  const { data: pulseData } = usePulseQuery(campaignId);
  const { data: decisionsData = null, isLoading: isLoadingDecisions } = useDecisionsQuery(campaignId);

  const investigateMutation = useInvestigateDecisionsMutation(campaignId);
  const ingestYouTubeMutation = useIngestYouTubeMutation(campaignId);
  const groundGoogleSearchMutation = useGroundGoogleSearchMutation(campaignId);

  const sentiment = analyticsData?.sentiment || {
    positive: 0,
    negative: 0,
    neutral: 0,
    posPercent: 0,
    negPercent: 0,
  };

  const themeStats = analyticsData?.themes || [];
  const conflictingSignals = analyticsData?.conflicts || [];
  const platforms = analyticsData?.platforms || {};
  const pulseSummary = pulseData?.pulseSummary || "Audience metrics show healthy engagement across key themes.";

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: campaignDetailKeys.all(campaignId) });
    queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
  };

  const triggerIngest = async (
    query: string,
    limit: number = 3,
    maxComments: number = 1000
  ): Promise<IngestResponse | null> => {
    try {
      const res = await ingestYouTubeMutation.mutateAsync({ query, limit, maxComments });
      return res;
    } catch {
      return null;
    }
  };

  const triggerGoogleSearch = async (query?: string): Promise<boolean> => {
    try {
      await groundGoogleSearchMutation.mutateAsync(query);
      return true;
    } catch {
      return false;
    }
  };

  const triggerInvestigation = async (): Promise<boolean> => {
    try {
      await investigateMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  };

  return {
    campaign,
    isLoadingCampaign,
    comments,
    isLoadingComments,
    sentiment,
    themeStats,
    conflictingSignals,
    platforms,
    drops,
    pulseSummary,
    decisionsData,
    isLoadingDecisions,
    isInvestigating: investigateMutation.isPending,
    isIngesting: ingestYouTubeMutation.isPending,
    isGroundingSearch: groundGoogleSearchMutation.isPending,
    refreshAll,
    triggerIngest,
    triggerGoogleSearch,
    triggerInvestigation,
  };
}
