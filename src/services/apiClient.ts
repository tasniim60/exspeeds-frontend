/**
 * Clean Architecture HTTP Client
 * Lightweight, robust fetch client with configurable timeout and error handling.
 */

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT_MS = 10000;

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T | null> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, params, headers, ...customConfig } = options;

  let url = endpoint;
  if (params) {
    const query = Object.entries(params)
      .filter(([_, val]) => val !== undefined && val !== null)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
      .join("&");
    if (query) {
      url += (url.includes("?") ? "&" : "?") + query;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.warn(`[apiClient] HTTP ${response.status} from ${endpoint}:`, errorData);
      return null;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.error(`[apiClient] Request timeout after ${timeoutMs}ms: ${endpoint}`);
    } else {
      console.error(`[apiClient] Network error for ${endpoint}:`, err);
    }
    return null;
  }
}

export const http = {
  get: <T>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: "DELETE" }),
};
