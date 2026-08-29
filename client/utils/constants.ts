export const API_BASE_URL = "http://127.0.0.1:8080";

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  MOVIES: `${API_BASE_URL}/api/movies`,
  COMMENTS: (contentId: string) => `${API_BASE_URL}/api/comments/${contentId}`,
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_STREAM: `${API_BASE_URL}/api/chat/stream`,
  INGEST: `${API_BASE_URL}/api/ingest`,
} as const;

export const SESSION_CONFIG = {
  DEFAULT_SESSION_ID: "studio_oracle_web_session",
  DEFAULT_USER_ID: "studio_oracle_web_user",
} as const;
