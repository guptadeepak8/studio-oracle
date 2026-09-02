import { toast } from "sonner";
import { API_BASE_URL } from "./constants";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Standard typed JSON request wrapper with unified error handling.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit & { suppressErrorToast?: boolean }
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    let data: any = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg =
        (typeof data === "object" && (data?.detail || data?.message)) ||
        res.statusText ||
        `Request failed with status ${res.status}`;
      
      if (!options?.suppressErrorToast) {
        toast.error(errorMsg);
      }
      throw new ApiError(errorMsg, res.status, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    const networkMsg = err?.message || "Network connection error";
    if (!options?.suppressErrorToast) {
      toast.error(networkMsg);
    }
    throw new ApiError(networkMsg, 0);
  }
}

