import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthShell } from "@/components/site/AuthShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign up — GAP VoicePilot" },
      { name: "description", content: "Create a free GAP VoicePilot account and start building voice AI agents." },
    ],
  }),
  component: () => (
    <AuthShell
      title="Create your account"
      subtitle="Free tier includes 1,000 minutes. No credit card required."
      cta="Create account"
      altText="Already have an account?"
      altLink="/login"
      altLabel="Log in"
    />
  ),
});
