"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Spinner } from "@/components/Spinner";

/**
 * The backend redirects here after:
 * 1. Exchanging the GitHub code for a user
 * 2. Setting the HTTP-only access_token cookie
 *
 * We just confirm the session is valid then push to /dashboard.
 * If the backend passed ?error=..., we show the error and send to /login.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      setStatus("error");
      setTimeout(() => router.replace("/login"), 3000);
      return;
    }

    // Verify the cookie was set by calling /auth/me
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    fetch(`${apiUrl}/auth/me`, {
      credentials: "include",
      headers: { "X-API-Version": "1" },
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          router.replace("/dashboard");
        } else {
          throw new Error("Session not established");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Authentication failed. Please try again.");
        setTimeout(() => router.replace("/login"), 3000);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
        <Zap className="w-6 h-6 text-accent" />
      </div>

      {status === "checking" && (
        <div className="text-center space-y-2">
          <Spinner className="text-accent mx-auto mb-3 scale-150" />
          <p className="text-cream font-medium">Establishing session…</p>
          <p className="text-slate-light text-sm">Just a moment</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-2">
          <p className="text-cream font-medium">Logged in! Redirecting…</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center space-y-2">
          <p className="text-signal-red font-medium">Authentication failed</p>
          <p className="text-slate-light text-sm">{errorMsg}</p>
          <p className="text-slate-mid text-xs">Redirecting to login…</p>
        </div>
      )}
    </div>
  );
}