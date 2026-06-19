import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthShell } from "@/components/site/AuthShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Log in — GAP VoicePilot" },
      { name: "description", content: "Log in to your GAP VoicePilot voice AI account." },
    ],
  }),
  component: () => (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue building voice agents."
      cta="Log in"
      altText="New here?"
      altLink="/signup"
      altLabel="Create an account"
    />
  ),
});
