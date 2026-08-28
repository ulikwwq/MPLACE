import { ApiError, isApiErrorBody } from "../types/api";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    // Network failure: backend unreachable, CORS blocked, DNS, etc.
    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: 0,
      error: "NETWORK_ERROR",
      message: "Could not reach the server. Check your connection and try again.",
    });
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    if (isApiErrorBody(data)) {
      throw new ApiError(data);
    }
    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: response.status,
      error: "UNKNOWN_ERROR",
      message: `Request failed with status ${response.status}`,
    });
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
