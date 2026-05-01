"use client";

import { useCallback, useEffect, useState } from "react";
import {
  profilesApi,
  type Profile,
  type ProfileFilters,
  type PaginatedResponse,
  ApiError,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Pagination } from "@/components/Pagination";
import { SkeletonTable } from "@/components/SkeletonTable";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "@/components/Toast";
import {
  Users,
  Download,
  Plus,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { formatDateShort, capitalize, pct } from "@/lib/utils";

const GENDER_OPTIONS = ["", "male", "female"];
const AGE_GROUP_OPTIONS = ["", "child", "teenager", "adult", "senior"];
const SORT_OPTIONS = [
  { value: "created_at", label: "Date Created" },
  { value: "name", label: "Name" },
  { value: "age", label: "Age" },
  { value: "gender", label: "Gender" },
  { value: "country_name", label: "Country" },
];

function SortButton({
  field,
  current,
  order,
  onChange,
}: {
  field: string;
  current: string;
  order: "asc" | "desc";
  onChange: (f: string) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onChange(field)}
      className="inline-flex items-center gap-1 hover:text-cream transition-colors"
    >
      {active ? (
        order === "asc" ? (
          <ChevronUp className="w-3 h-3 text-accent" />
        ) : (
          <ChevronDown className="w-3 h-3 text-accent" />
        )
      ) : (
        <ChevronDown className="w-3 h-3 opacity-30" />
      )}
    </button>
  );
}

export default function ProfilesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PaginatedResponse<Profile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState<ProfileFilters>({
    page: 1,
    limit: 20,
    gender: "",
    country: "",
    age_group: "",
    min_age: undefined,
    max_age: undefined,
    sort_by: "created_at",
    order: "desc",
  });

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profilesApi.list(filters);
      setData(res);
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleFilter = (key: keyof ProfileFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: field,
      order:
        prev.sort_by === field ? (prev.order === "asc" ? "desc" : "asc") : "desc",
      page: 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await profilesApi.exportCsv(filters);
      toast("success", "CSV exported successfully");
    } catch {
      toast("error", "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await profilesApi.delete(deleteTarget.id);
      toast("success", `Profile "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchProfiles();
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-cream">Profiles</h1>
          {data && (
            <p className="text-slate-light text-sm mt-1">
              {data.total.toLocaleString()} total profiles
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-ghost"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          {user?.role === "admin" && (
            <Link href="/profiles/create" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              New Profile
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Gender */}
          <div>
            <label className="block text-xs text-slate-light mb-1">Gender</label>
            <select
              className="select"
              value={filters.gender}
              onChange={(e) => handleFilter("gender", e.target.value)}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g ? capitalize(g) : "All genders"}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs text-slate-light mb-1">Country code</label>
            <input
              className="input"
              placeholder="e.g. NG, US"
              value={filters.country ?? ""}
              onChange={(e) => handleFilter("country", e.target.value.toUpperCase())}
            />
          </div>

          {/* Age group */}
          <div>
            <label className="block text-xs text-slate-light mb-1">Age group</label>
            <select
              className="select"
              value={filters.age_group}
              onChange={(e) => handleFilter("age_group", e.target.value)}
            >
              {AGE_GROUP_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g ? capitalize(g) : "All groups"}
                </option>
              ))}
            </select>
          </div>

          {/* Min age */}
          <div>
            <label className="block text-xs text-slate-light mb-1">Min age</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={filters.min_age ?? ""}
              onChange={(e) =>
                handleFilter("min_age", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          {/* Max age */}
          <div>
            <label className="block text-xs text-slate-light mb-1">Max age</label>
            <input
              type="number"
              className="input"
              placeholder="100"
              value={filters.max_age ?? ""}
              onChange={(e) =>
                handleFilter("max_age", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs text-slate-light mb-1">Sort by</label>
            <select
              className="select"
              value={filters.sort_by}
              onChange={(e) => handleFilter("sort_by", e.target.value)}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order toggle & limit */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button
            onClick={() =>
              setFilters((p) => ({
                ...p,
                order: p.order === "asc" ? "desc" : "asc",
              }))
            }
            className="btn btn-ghost py-1.5 px-3 text-xs"
          >
            {filters.order === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-light">
            <span>Per page:</span>
            {[10, 20, 50].map((n) => (
              <button
                key={n}
                onClick={() => handleFilter("limit", n)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  filters.limit === n
                    ? "bg-accent/20 text-accent"
                    : "text-slate-light hover:text-cream"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setFilters({
                page: 1,
                limit: 20,
                gender: "",
                country: "",
                age_group: "",
                min_age: undefined,
                max_age: undefined,
                sort_by: "created_at",
                order: "desc",
              })
            }
            className="text-xs text-slate-light hover:text-cream transition-colors ml-auto"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No profiles found"
            description="Try adjusting your filters or create a new profile."
            action={
              user?.role === "admin" ? (
                <Link href="/profiles/create" className="btn btn-primary">
                  <Plus className="w-4 h-4" /> New Profile
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <span className="flex items-center gap-1">
                      Name
                      <SortButton
                        field="name"
                        current={filters.sort_by ?? ""}
                        order={filters.order ?? "desc"}
                        onChange={toggleSort}
                      />
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      Gender
                      <SortButton
                        field="gender"
                        current={filters.sort_by ?? ""}
                        order={filters.order ?? "desc"}
                        onChange={toggleSort}
                      />
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      Age
                      <SortButton
                        field="age"
                        current={filters.sort_by ?? ""}
                        order={filters.order ?? "desc"}
                        onChange={toggleSort}
                      />
                    </span>
                  </th>
                  <th>Age Group</th>
                  <th>
                    <span className="flex items-center gap-1">
                      Country
                      <SortButton
                        field="country_name"
                        current={filters.sort_by ?? ""}
                        order={filters.order ?? "desc"}
                        onChange={toggleSort}
                      />
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1">
                      Created
                      <SortButton
                        field="created_at"
                        current={filters.sort_by ?? ""}
                        order={filters.order ?? "desc"}
                        onChange={toggleSort}
                      />
                    </span>
                  </th>
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
                      <span className="ml-1.5 text-[10px] font-mono text-slate-mid">
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
                    <td>
                      <span className="text-cream">{profile.country_name}</span>
                      <span className="ml-1.5 text-[10px] font-mono text-slate-mid">
                        {profile.country_id}
                      </span>
                    </td>
                    <td className="text-slate-light text-xs">
                      {formatDateShort(profile.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/profiles/${profile.id}`}
                          className="p-1.5 rounded hover:bg-accent/10 text-slate-light hover:text-accent transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => setDeleteTarget(profile)}
                            className="p-1.5 rounded hover:bg-signal-red/10 text-slate-light hover:text-signal-red transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Profile"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}