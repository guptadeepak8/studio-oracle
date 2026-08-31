export const API_BASE_URL = "http://127.0.0.1:8080";

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  MOVIES: `${API_BASE_URL}/api/movies`,
  COMMENTS: (contentId: string) => `${API_BASE_URL}/api/comments/${contentId}`,
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_STREAM: `${API_BASE_URL}/api/chat/stream`,
  INGEST: `${API_BASE_URL}/api/ingest`,
  CAMPAIGNS: `${API_BASE_URL}/api/campaigns`,
  CAMPAIGN_STATUS: (contentId: string) => `${API_BASE_URL}/api/campaigns/${contentId}/status`,
  DELETE_CAMPAIGN: (contentId: string) => `${API_BASE_URL}/api/campaigns/${contentId}`,
  ANALYTICS: (contentId: string) => `${API_BASE_URL}/api/campaigns/${contentId}/analytics`,
  TIMELINE: (contentId: string) => `${API_BASE_URL}/api/campaigns/${contentId}/timeline`,
  PULSE: (contentId: string) => `${API_BASE_URL}/api/campaigns/${contentId}/pulse`,
} as const;

export const SESSION_CONFIG = {
  DEFAULT_SESSION_ID: "studio_oracle_web_session",
  DEFAULT_USER_ID: "studio_oracle_web_user",
} as const;
