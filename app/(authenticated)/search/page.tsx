"use client";

import { useState, useCallback } from "react";
import { profilesApi, type Profile, type PaginatedResponse, ApiError } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { SkeletonTable } from "@/components/SkeletonTable";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "@/components/Toast";
import { Search, Sparkles, Eye } from "lucide-react";
import Link from "next/link";
import { formatDateShort, pct, capitalize } from "@/lib/utils";

const EXAMPLES = [
  "young males from Nigeria",
  "adult females in the US",
  "seniors from the UK",
  "teens with high gender confidence",
  "people aged 25 to 35",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<PaginatedResponse<Profile> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastQuery, setLastQuery] = useState("");

  const doSearch = useCallback(
    async (q: string, p = 1) => {
      if (!q.trim()) return;
      setLoading(true);
      setLastQuery(q);
      try {
        const res = await profilesApi.search(q, p, 20);
        setData(res);
        setPage(p);
      } catch (e) {
        toast("error", e instanceof ApiError ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query, 1);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-cream">Natural Language Search</h1>
        <p className="text-slate-light text-sm mt-1">
          Describe who you&apos;re looking for in plain English.
        </p>
      </div>

      {/* Search bar */}
      <div className="card p-6 space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light pointer-events-none" />
            <input
              className="input pl-9 text-base"
              placeholder='Try "young males from Nigeria" or "adult females in the US"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn btn-primary px-5"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Example queries */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-mid">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                doSearch(ex, 1);
              }}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-edge text-slate-light hover:text-cream hover:border-slate-mid transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="card overflow-hidden">
          <SkeletonTable rows={8} cols={6} />
        </div>
      ) : data ? (
        <>
          {/* Meta */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-light">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>
                <span className="text-cream font-medium">{data.total.toLocaleString()}</span>{" "}
                results for{" "}
                <span className="text-accent font-medium">&ldquo;{lastQuery}&rdquo;</span>
              </span>
            </div>
          </div>

          <div className="card overflow-hidden">
            {data.data.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No results found"
                description="Try rephrasing your query. For example: 'adult males from US'."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Age Group</th>
                      <th>Country</th>
                      <th>Created</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((profile) => (
                      <tr key={profile.id}>
                        <td className="font-medium">{profile.name}</td>
                        <td>
                          <span
                            className={`badge ${
                              profile.gender === "male"
                                ? "badge-blue"
                                : profile.gender === "female"
                                ? "badge-accent"
                                : "badge-slate"
                            }`}
                          >
                            {profile.gender}
                          </span>
                          <span className="ml-1 text-[10px] font-mono text-slate-mid">
                            {pct(profile.gender_probability)}
                          </span>
                        </td>
                        <td className="font-mono text-sm">{profile.age}</td>
                        <td>
                          <span
                            className={`badge ${
                              profile.age_group === "adult"
                                ? "badge-green"
                                : profile.age_group === "senior"
                                ? "badge-slate"
                                : "badge-amber"
                            }`}
                          >
                            {profile.age_group}
                          </span>
                        </td>
                        <td className="text-slate-light">
                          {profile.country_name}{" "}
                          <span className="text-slate-mid text-xs">{profile.country_id}</span>
                        </td>
                        <td className="text-slate-light text-xs">
                          {formatDateShort(profile.created_at)}
                        </td>
                        <td>
                          <Link
                            href={`/profiles/${profile.id}`}
                            className="p-1.5 rounded hover:bg-accent/10 text-slate-light hover:text-accent transition-colors inline-flex"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Pagination
            page={page}
            totalPages={data.total_pages}
            onPageChange={(p) => doSearch(lastQuery, p)}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-ink-muted border border-slate-edge flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-slate-mid" />
          </div>
          <p className="text-slate-light">
            Enter a query above to search profiles
          </p>
          <p className="text-slate-mid text-sm mt-1">
            Natural language parsing powered by the backend
          </p>
        </div>
      )}
    </div>
  );
}