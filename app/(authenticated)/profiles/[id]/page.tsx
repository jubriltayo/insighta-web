"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { profilesApi, type Profile, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "@/components/Toast";
import { Spinner } from "@/components/Spinner";
import {
  ArrowLeft,
  User,
  Globe,
  Calendar,
  BarChart2,
  Trash2,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { formatDate, pct, capitalize } from "@/lib/utils";

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    profilesApi
      .get(id)
      .then((res) => setProfile(res.data))
      .catch(() => toast("error", "Profile not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await profilesApi.delete(id);
      toast("success", "Profile deleted");
      router.replace("/profiles");
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="text-accent scale-150" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-cream text-lg">Profile not found.</p>
        <Link href="/profiles" className="btn btn-ghost">
          <ArrowLeft className="w-4 h-4" /> Back to Profiles
        </Link>
      </div>
    );
  }

  const genderColor =
    profile.gender === "male"
      ? "text-signal-blue"
      : profile.gender === "female"
      ? "text-accent"
      : "text-slate-light";

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link
        href="/profiles"
        className="inline-flex items-center gap-2 text-slate-light hover:text-cream text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profiles
      </Link>

      {/* Hero card */}
      <div className="card p-8 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${
              profile.gender === "male"
                ? "var(--signal-blue)"
                : profile.gender === "female"
                ? "var(--accent)"
                : "var(--slate-mid)"
            }, transparent)`,
            opacity: 0.5,
          }}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-ink-muted border border-slate-edge flex items-center justify-center">
                <User className="w-6 h-6 text-slate-light" />
              </div>
              <div>
                <h1 className="font-display text-3xl text-cream">{profile.name}</h1>
                <p className="text-slate-light text-sm font-mono">{profile.id}</p>
              </div>
            </div>
          </div>

          {user?.role === "admin" && (
            <button
              onClick={() => setShowDelete(true)}
              className="btn btn-danger"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {/* Gender */}
          <div className="bg-ink-muted rounded-xl p-4 border border-slate-edge">
            <div className="text-xs text-slate-light uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3 h-3" />
              Gender
            </div>
            <div className={`text-xl font-display capitalize ${genderColor}`}>
              {profile.gender}
            </div>
            <div className="text-[11px] font-mono text-slate-mid mt-1">
              {pct(profile.gender_probability)} confidence
            </div>
          </div>

          {/* Age */}
          <div className="bg-ink-muted rounded-xl p-4 border border-slate-edge">
            <div className="text-xs text-slate-light uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart2 className="w-3 h-3" />
              Age
            </div>
            <div className="text-xl font-display text-cream">{profile.age}</div>
            <div className="text-[11px] font-mono text-slate-mid mt-1 capitalize">
              {profile.age_group}
            </div>
          </div>

          {/* Country */}
          <div className="bg-ink-muted rounded-xl p-4 border border-slate-edge">
            <div className="text-xs text-slate-light uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Country
            </div>
            <div className="text-xl font-display text-cream">
              {profile.country_id}
            </div>
            <div className="text-[11px] font-mono text-slate-mid mt-1">
              {profile.country_name} · {pct(profile.country_probability)}
            </div>
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xs text-slate-light uppercase tracking-wider font-semibold">
          Full Details
        </h2>
        {[
          {
            icon: Hash,
            label: "Profile ID",
            value: profile.id,
            mono: true,
          },
          {
            icon: User,
            label: "Full name",
            value: profile.name,
          },
          {
            icon: User,
            label: "Gender",
            value: `${capitalize(profile.gender)} (${pct(profile.gender_probability)} confidence)`,
          },
          {
            icon: BarChart2,
            label: "Estimated age",
            value: `${profile.age} years old — ${capitalize(profile.age_group)}`,
          },
          {
            icon: Globe,
            label: "Country",
            value: `${profile.country_name} (${profile.country_id}) — ${pct(profile.country_probability)} confidence`,
          },
          {
            icon: Calendar,
            label: "Created at",
            value: formatDate(profile.created_at),
          },
        ].map(({ icon: Icon, label, value, mono }) => (
          <div
            key={label}
            className="flex items-start gap-4 py-3 border-b border-slate-edge/50 last:border-0"
          >
            <Icon className="w-4 h-4 text-slate-light mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-light mb-0.5">{label}</div>
              <div
                className={`text-sm text-cream ${mono ? "font-mono" : ""} break-all`}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence bars */}
      <div className="card p-6">
        <h2 className="text-xs text-slate-light uppercase tracking-wider font-semibold mb-4">
          Prediction Confidence
        </h2>
        <div className="space-y-4">
          {[
            {
              label: "Gender confidence",
              value: profile.gender_probability,
              color: profile.gender === "male" ? "bg-signal-blue" : "bg-accent",
            },
            {
              label: "Country confidence",
              value: profile.country_probability,
              color: "bg-signal-green",
            },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-light">{label}</span>
                <span className="font-mono text-cream text-xs">{pct(value)}</span>
              </div>
              <div className="h-2 bg-ink-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full`}
                  style={{
                    width: `${value * 100}%`,
                    transition: "width 0.9s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        title="Delete Profile"
        description={`Delete "${profile.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleting}
      />
    </div>
  );
}