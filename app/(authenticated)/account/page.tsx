"use client";

import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/Spinner";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="text-accent scale-150" />
      </div>
    );
  }

  if (!user) return null;

  const infoRows = [
    { icon: User, label: "Username", value: `@${user.username}` },
    { icon: Mail, label: "Email", value: user.email || "Not provided" },
    { icon: SiGithub, label: "GitHub ID", value: user.github_id },
    {
      icon: Shield,
      label: "Role",
      value: (
        <span
          className={`badge ${
            user.role === "admin" ? "badge-accent" : "badge-blue"
          } capitalize`}
        >
          {user.role}
        </span>
      ),
    },
    {
      icon: CheckCircle,
      label: "Account status",
      value: user.is_active ? (
        <span className="flex items-center gap-1.5 text-signal-green">
          <CheckCircle className="w-3.5 h-3.5" />
          Active
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-signal-red">
          <XCircle className="w-3.5 h-3.5" />
          Suspended
        </span>
      ),
    },
    {
      icon: Calendar,
      label: "Member since",
      value: formatDate(user.created_at),
    },
    {
      icon: Clock,
      label: "Last login",
      value: user.last_login_at ? formatDate(user.last_login_at) : "—",
    },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl text-cream">Account</h1>

      {/* Profile card */}
      <div className="card p-8">
        <div className="flex items-center gap-5 mb-8">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.username}
              width={72}
              height={72}
              className="w-18 h-18 rounded-2xl object-cover ring-2 ring-slate-edge"
              style={{ width: 72, height: 72 }}
            />
          ) : (
            <div className="w-18 h-18 rounded-2xl bg-accent/20 border border-accent/20 flex items-center justify-center" style={{ width: 72, height: 72 }}>
              <span className="text-2xl text-accent font-display">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-display text-2xl text-cream">{user.username}</h2>
            <p className="text-slate-light text-sm">{user.email}</p>
            <span
              className={`badge mt-1 ${
                user.role === "admin" ? "badge-accent" : "badge-blue"
              } capitalize`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-0.5">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 py-3.5 border-b border-slate-edge/50 last:border-0"
            >
              <Icon className="w-4 h-4 text-slate-light shrink-0" />
              <div className="flex-1 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-light">{label}</span>
                <span className="text-sm text-cream text-right">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role permissions */}
      <div className="card p-6">
        <h2 className="text-xs text-slate-light uppercase tracking-wider font-semibold mb-4">
          Your permissions
        </h2>
        <div className="space-y-2">
          {[
            {
              label: "View profiles",
              allowed: true,
            },
            {
              label: "Search profiles",
              allowed: true,
            },
            {
              label: "Export profiles (CSV)",
              allowed: true,
            },
            {
              label: "Create profiles",
              allowed: user.role === "admin",
            },
            {
              label: "Delete profiles",
              allowed: user.role === "admin",
            },
          ].map(({ label, allowed }) => (
            <div key={label} className="flex items-center gap-3 py-2">
              {allowed ? (
                <CheckCircle className="w-4 h-4 text-signal-green shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-mid shrink-0" />
              )}
              <span
                className={`text-sm ${
                  allowed ? "text-cream" : "text-slate-mid"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="card p-6">
        <h2 className="text-xs text-slate-light uppercase tracking-wider font-semibold mb-4">
          Session
        </h2>
        <p className="text-slate-light text-sm mb-4">
          Signing out will clear your session and require you to log in again.
        </p>
        <button onClick={logout} className="btn btn-danger gap-2">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}