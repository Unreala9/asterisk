import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }: any) => {
      if (error) {
        console.error("OAuth callback error:", error.message);
        toast.error("Sign in failed. Please try again.");
        navigate({ to: "/login" });
      } else {
        navigate({ to: "/dashboard" });
      }
    });
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-black/20" />
        <p className="text-[13px] font-mono uppercase tracking-widest text-black/30">
          Signing you in...
        </p>
      </div>
    </div>
  );
}
