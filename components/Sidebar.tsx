"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Search,
  UserCircle,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profiles", label: "Profiles", icon: Users },
  { href: "/search", label: "Search", icon: Search },
  { href: "/account", label: "Account", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0 bg-ink-soft border-r border-slate-edge">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-edge">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="font-display text-cream text-base leading-none">
              Insighta
            </div>
            <div className="text-[10px] text-slate-light uppercase tracking-widest">
              Labs+
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-slate-light hover:text-cream hover:bg-ink-muted"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-accent" : "text-slate-light group-hover:text-cream"
                )}
              />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-accent opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-edge">
        {loading ? (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full skeleton" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 skeleton rounded" />
              <div className="h-2.5 w-16 skeleton rounded" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 px-3 py-2.5">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.username}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-edge"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-xs text-accent font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-cream font-medium truncate">
                @{user.username}
              </p>
              <p className="text-[11px] text-slate-light capitalize">
                {user.role}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-slate-light hover:text-signal-red transition-colors p-1 rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}