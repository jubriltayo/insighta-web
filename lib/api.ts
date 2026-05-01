"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
};

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers: extraHeaders, ...rest } = options;

  let url = `${API_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        qs.set(k, String(v));
      }
    }
    const str = qs.toString();
    if (str) url += `?${str}`;
  }

  const res = await fetch(url, {
    ...rest,
    credentials: "include", // always send the HTTP-only cookie
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": "1",
      ...(extraHeaders as Record<string, string>),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 → redirect to login
  if (res.status === 401) {
    window.location.href = "/login";
    throw new ApiError(401, "Unauthenticated");
  }

  // 429 → rate limited
  if (res.status === 429) {
    throw new ApiError(429, "Too many requests. Please slow down.");
  }

  let data: unknown;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/csv")) {
    // return raw text for CSV downloads
    return (await res.text()) as unknown as T;
  }

  try {
    data = await res.json();
  } catch {
    throw new ApiError(res.status, "Invalid response from server");
  }

  if (!res.ok) {
    const msg =
      (data as { message?: string })?.message ?? `Request failed: ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  return data as T;
}

/* ── Auth ── */
export const authApi = {
  me: () => request<{ status: string; data: import("@/lib/auth-server").User }>("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
};

/* ── Profile types ── */
export interface Profile {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  status: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links: {
    self: string;
    next: string | null;
    prev: string | null;
  };
  data: T[];
}

export interface ProfileFilters {
  page?: number;
  limit?: number;
  gender?: string;
  country?: string;
  age_group?: string;
  min_age?: number;
  max_age?: number;
  sort_by?: string;
  order?: "asc" | "desc";
}

/* ── Profiles ── */
export const profilesApi = {
  list: (filters: ProfileFilters = {}) =>
    request<PaginatedResponse<Profile>>("/api/profiles", { params: filters as Record<string, string | number | boolean | undefined | null> }),

  get: (id: string) =>
    request<{ status: string; data: Profile }>(`/api/profiles/${id}`),

  search: (q: string, page = 1, limit = 10) =>
    request<PaginatedResponse<Profile>>("/api/profiles/search", {
      params: { q, page, limit },
    }),

  create: (name: string) =>
    request<{ status: string; data: Profile }>("/api/profiles", {
      method: "POST",
      body: { name },
    }),

  delete: (id: string) =>
    request(`/api/profiles/${id}`, { method: "DELETE" }),

  exportCsv: async (filters: ProfileFilters = {}) => {
    const qs = new URLSearchParams({ format: "csv" });
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const url = `${API_URL}/api/profiles/export?${qs}`;
    const res = await fetch(url, {
      credentials: "include",
      headers: { "X-API-Version": "1" },
    });
    if (!res.ok) throw new ApiError(res.status, "Export failed");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `profiles_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  stats: () =>
    request<{
      status: string;
      data: {
        total: number;
        by_gender: Record<string, number>;
        by_age_group: Record<string, number>;
        by_country: { country_name: string; count: number }[];
      };
    }>("/api/profiles/stats"),
};