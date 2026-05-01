"use client";

import { useEffect, useState } from "react";
import { profilesApi, type Profile, type PaginatedResponse } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  TrendingUp,
  Globe,
  Activity,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatDateShort, capitalize, pct } from "@/lib/utils";

interface Stats {
  total: number;
  by_gender: Record<string, number>;
  by_age_group: Record<string, number>;
  by_country: { country_name: string; count: number }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      profilesApi.stats().catch(() => null),
      profilesApi.list({ limit: 5, sort_by: "created_at", order: "desc" }).catch(() => null),
    ]).then(([statsData, profilesData]) => {
      if (statsData) setStats(statsData.data);
      if (profilesData) setRecent(profilesData.data);
      setLoading(false);
    });
  }, []);

  const statCards = stats
    ? [
        {
          icon: Users,
          label: "Total Profiles",
          value: stats.total.toLocaleString(),
          sub: "across all records",
          color: "text-accent",
          bg: "bg-accent/10",
        },
        {
          icon: TrendingUp,
          label: "Most Common Gender",
          value: capitalize(
            Object.entries(stats.by_gender).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
          ),
          sub: `${Object.entries(stats.by_gender).sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0} profiles`,
          color: "text-signal-blue",
          bg: "bg-signal-blue/10",
        },
        {
          icon: Globe,
          label: "Top Country",
          value: stats.by_country[0]?.country_name ?? "—",
          sub: `${stats.by_country[0]?.count ?? 0} profiles`,
          color: "text-signal-green",
          bg: "bg-signal-green/10",
        },
        {
          icon: Activity,
          label: "Age Groups",
          value: Object.keys(stats.by_age_group).length.toString(),
          sub: "distinct groups",
          color: "text-signal-amber",
          bg: "bg-signal-amber/10",
        },
      ]
    : [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-cream">
            {user ? `Good day, @${user.username}` : "Dashboard"}
          </h1>
          <p className="text-slate-light mt-1 text-sm">
            Here&apos;s what&apos;s happening in the system.
          </p>
        </div>
        {user?.role === "admin" && (
          <Link href="/profiles/create" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            New Profile
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="w-9 h-9 skeleton rounded-lg mb-4" />
                <div className="h-8 w-24 skeleton rounded mb-2" />
                <div className="h-3 w-32 skeleton rounded" />
              </div>
            ))
          : statCards.map(({ icon: Icon, label, value, sub, color, bg }) => (
              <div key={label} className="stat-card">
                <div
                  className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
                </div>
                <div className={`text-3xl font-display ${color} leading-none mb-1`}>
                  {value}
                </div>
                <div className="text-xs text-slate-light">{label}</div>
                <div className="text-[11px] text-slate-mid mt-0.5">{sub}</div>
              </div>
            ))}
      </div>

      {/* Gender breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender bar */}
          <div className="card p-6">
            <h2 className="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">
              Gender Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.by_gender)
                .sort((a, b) => b[1] - a[1])
                .map(([gender, count]) => {
                  const perc = stats.total ? (count / stats.total) * 100 : 0;
                  const colorMap: Record<string, string> = {
                    male: "bg-signal-blue",
                    female: "bg-accent",
                    unknown: "bg-slate-mid",
                  };
                  return (
                    <div key={gender}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-cream capitalize">{gender}</span>
                        <span className="text-slate-light font-mono text-xs">
                          {count.toLocaleString()} · {perc.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-ink-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorMap[gender] ?? "bg-slate-mid"}`}
                          style={{ width: `${perc}%`, transition: "width 0.8s ease" }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Top countries */}
          <div className="card p-6">
            <h2 className="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">
              Top Countries
            </h2>
            <div className="space-y-2">
              {stats.by_country.slice(0, 6).map(({ country_name, count }, i) => (
                <div
                  key={country_name}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span className="text-xs text-slate-mid w-4 font-mono">
                    {i + 1}
                  </span>
                  <span className="text-cream text-sm flex-1">{country_name}</span>
                  <span className="font-mono text-xs text-slate-light">
                    {count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Age group breakdown */}
      {stats && Object.keys(stats.by_age_group).length > 0 && (
        <div className="card p-6">
          <h2 className="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">
            Age Group Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats.by_age_group)
              .sort((a, b) => b[1] - a[1])
              .map(([group, count]) => (
                <div
                  key={group}
                  className="bg-ink-muted rounded-xl p-4 border border-slate-edge"
                >
                  <div className="text-xl font-display text-cream mb-0.5">
                    {count.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-light capitalize">{group}</div>
                  <div className="text-[10px] text-slate-mid mt-1 font-mono">
                    {stats.total ? pct(count / stats.total) : "—"}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent profiles */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-cream font-semibold text-sm uppercase tracking-wider">
            Recent Profiles
          </h2>
          <Link
            href="/profiles"
            className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center py-2">
                <div className="h-4 w-32 skeleton rounded" />
                <div className="h-4 w-16 skeleton rounded" />
                <div className="h-4 w-20 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-slate-light text-sm">No profiles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Country</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>
                      <span
                        className={`badge ${p.gender === "male" ? "badge-blue" : p.gender === "female" ? "badge-accent" : "badge-slate"}`}
                      >
                        {p.gender}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{p.age}</td>
                    <td className="text-slate-light">{p.country_name}</td>
                    <td className="text-slate-light text-xs">
                      {formatDateShort(p.created_at)}
                    </td>
                    <td>
                      <Link
                        href={`/profiles/${p.id}`}
                        className="text-accent text-xs hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}