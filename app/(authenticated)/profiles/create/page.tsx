"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { profilesApi, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/Toast";
import { Spinner } from "@/components/Spinner";
import { ArrowLeft, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { pct, capitalize } from "@/lib/utils";

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof profilesApi.create>> | null>(null);

  // Redirect non-admins
  if (!authLoading && user?.role !== "admin") {
    router.replace("/profiles");
    return null;
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast("error", "Please enter a name");
      return;
    }
    setLoading(true);
    try {
      const res = await profilesApi.create(name.trim());
      setResult(res);
      toast("success", `Profile for "${res.data.name}" created`);
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6 animate-fade-in">
      <Link
        href="/profiles"
        className="inline-flex items-center gap-2 text-slate-light hover:text-cream text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profiles
      </Link>

      <div>
        <h1 className="font-display text-3xl text-cream">Create Profile</h1>
        <p className="text-slate-light text-sm mt-1">
          Enter a name to fetch gender, age, and nationality predictions.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-xs text-slate-light uppercase tracking-wider mb-2">
            Full name
          </label>
          <input
            className="input text-base"
            placeholder="e.g. Harriet Tubman"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="btn btn-primary w-full justify-center py-3"
        >
          {loading ? (
            <>
              <Spinner className="text-white" />
              <span>Fetching predictions…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Result preview */}
      {result && (
        <div className="card p-6 space-y-4 animate-slide-up border-accent/20">
          <div className="flex items-center gap-2 text-accent text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Profile created
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ink-muted border border-slate-edge flex items-center justify-center">
              <User className="w-6 h-6 text-slate-light" />
            </div>
            <div>
              <h2 className="text-cream font-display text-2xl">{result.data.name}</h2>
              <p className="text-slate-light text-xs font-mono">{result.data.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Gender",
                value: capitalize(result.data.gender),
                sub: pct(result.data.gender_probability),
              },
              {
                label: "Age",
                value: String(result.data.age),
                sub: capitalize(result.data.age_group),
              },
              {
                label: "Country",
                value: result.data.country_id,
                sub: result.data.country_name,
              },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="bg-ink-muted rounded-xl p-3 border border-slate-edge text-center"
              >
                <div className="text-xs text-slate-light mb-1">{label}</div>
                <div className="text-lg font-display text-cream">{value}</div>
                <div className="text-[10px] text-slate-mid">{sub}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/profiles/${result.data.id}`}
              className="btn btn-ghost flex-1 justify-center"
            >
              View Profile
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setName("");
              }}
              className="btn btn-primary flex-1 justify-center"
            >
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}