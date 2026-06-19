import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/voice-sso")({
  component: SSOPage,
});

export function SSOPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [message, setMessage] = useState("Signing you in from getaipilot.in...");

  useEffect(() => {
    const controller = new AbortController();

    const processSSO = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (token) {
        try {
          const payloadPart = token.split(".")[0];
          const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
          const decodedPayload = JSON.parse(atob(base64));
          const ssoEmail = decodedPayload?.email;

          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user?.email === ssoEmail) {
            navigate({ to: "/dashboard", replace: true });
            return;
          }

          if (session) {
            await supabase.auth.signOut();
          }
        } catch (e) {
          console.error("SSO token parsing error:", e);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate({ to: "/dashboard", replace: true });
          return;
        }

        setStatus("error");
        setMessage("No SSO token found. Please try launching Voice Pilot again from GetAiPilot.");
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/auth/sso`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));

        if (controller.signal.aborted) return;

        if (!res.ok || !data.magic_link_url) {
          const msg = data.error === "SSO token already used"
            ? "This sign-in link has already been used. Please go back to GetAiPilot and click Launch Voice Pilot again."
            : (data.detail || data.error || "Authentication failed. Please try again.");
          setStatus("error");
          setMessage(msg);
          return;
        }

        setMessage("Redirecting to your workspace...");
        window.location.href = data.magic_link_url;

      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setStatus("error");
        setMessage("Network error. Please check your connection and try again.");
      }
    };

    processSSO();
    return () => {
      controller.abort();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#f7f7f5] px-4 font-sans">
      <div className="w-full max-w-[420px] rounded-[24px] bg-white p-10 text-center shadow-lg border border-neutral-200/50">
        {status === "processing" && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
            <div>
              <h2 className="text-[22px] font-[540] tracking-tight text-black mb-2">
                Signing you in
              </h2>
              <p className="text-[14px] font-[330] text-neutral-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-[22px] font-[540] tracking-tight text-black mb-2">
                Sign-in failed
              </h2>
              <p className="text-[14px] font-[330] text-neutral-500 leading-relaxed mb-6">
                {message}
              </p>
              <button
                onClick={() => navigate({ to: "/login", replace: true })}
                className="flex items-center justify-center gap-2 mx-auto h-12 px-6 rounded-full border border-neutral-200 text-[14px] font-[480] text-black hover:bg-neutral-50 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Sign in manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
