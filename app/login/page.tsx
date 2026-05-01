import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { GitHubLoginButton } from "./GitHubLoginButton";
import { Zap, Shield, Users, BarChart3 } from "lucide-react";

export default async function LoginPage() {
  const user = await getServerUser();
  if (user) redirect("/dashboard");

  return (
    <div className="noise min-h-screen bg-ink flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(124,106,247,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-display text-cream text-xl leading-none">
                Insighta Labs+
              </div>
              <div className="text-[10px] text-slate-light uppercase tracking-[0.2em] mt-0.5">
                Profile Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-6">
          <h1 className="font-display text-5xl text-cream leading-[1.1]">
            Understand people
            <br />
            <em className="text-accent not-italic">at scale.</em>
          </h1>
          <p className="text-slate-light text-lg max-w-sm leading-relaxed">
            A secure intelligence platform for analysts and engineers. Search,
            filter, and export profile data — all in one place.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3 pt-2">
            {[
              { icon: Shield, label: "Role-based access" },
              { icon: Users, label: "Profile management" },
              { icon: BarChart3, label: "Analytics dashboard" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-muted border border-slate-edge text-sm text-slate-light"
              >
                <Icon className="w-3.5 h-3.5 text-accent" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative text-xs text-slate-mid">
          Insighta Labs — Internal access only.
        </p>
      </div>

      {/* Right — login card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <span className="font-display text-cream text-xl">Insighta Labs+</span>
          </div>

          <div className="card p-8 space-y-6">
            <div>
              <h2 className="font-display text-2xl text-cream">Welcome back</h2>
              <p className="text-slate-light text-sm mt-1">
                Sign in with your GitHub account to continue.
              </p>
            </div>

            <GitHubLoginButton />

            <p className="text-xs text-slate-mid text-center leading-relaxed">
              By continuing, you agree to the internal usage policy.
              <br />
              Access is restricted to authorised personnel only.
            </p>
          </div>

          <p className="text-center text-xs text-slate-mid">
            New users are assigned the{" "}
            <span className="text-slate-light">analyst</span> role by default.
          </p>
        </div>
      </div>
    </div>
  );
}