import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function AuthShell({
  title,
  subtitle,
  cta,
  altText,
  altLink,
  altLabel,
}: {
  title: string;
  subtitle: string;
  cta: string;
  altText: string;
  altLink: string;
  altLabel: string;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = cta === "Create account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error("Supabase is not initialized. Please check your environment variables.");
      return;
    }
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
        toast.success(
          "Account created! Please check your email for verification.",
        );
        navigate({ to: "/login" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'apple') => {
    if (!supabase) {
      toast.error("Supabase is not initialized. Please check your environment variables.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#000000" }}>

      {/* Left Canvas - Form */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto lg:overflow-hidden" style={{ padding: "40px" }}>

        <Link to="/" style={{ textDecoration: "none", color: "#000000", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 32, width: 32, objectFit: "contain" }} />
          <span style={{ fontSize: 22, fontWeight: 340, letterSpacing: "-0.03em" }}>GAP VoicePilot</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-[400px] w-full mx-auto" style={{ padding: "32px 0" }}>
          <h1 style={{ fontSize: "clamp(28px, 3.5vw, 36px)", fontWeight: 340, letterSpacing: "-0.02em", marginBottom: 8 }}>
            {title}
          </h1>
          <p style={{ fontSize: 15, fontWeight: 320, color: "#666", marginBottom: 24, lineHeight: 1.4 }}>
            {subtitle}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white border border-[#e6e6e6] rounded-[16px] py-3 text-[15px] font-[480] hover:bg-[#f9f9f9] transition-all hover:border-[#cccccc] active:scale-[0.98]"
              title="Sign in with Google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className="flex items-center justify-center gap-2.5 bg-white border border-[#e6e6e6] rounded-[16px] py-3 text-[15px] font-[480] hover:bg-[#f9f9f9] transition-all hover:border-[#cccccc] active:scale-[0.98]"
                title="Sign in with Apple"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.06.75 1.21-.02 2.36-.84 3.63-.77 1.6.09 2.84.66 3.61 1.76-3.2 1.83-2.69 6.22.47 7.5-.66 1.64-1.55 3.26-2.77 4.73zM12.03 7.25c-.08-2.69 2.21-4.94 4.81-5.25.33 3.12-3.03 5.48-4.81 5.25z"/>
                </svg>
                Apple
              </button>
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="flex items-center justify-center gap-2.5 bg-white border border-[#e6e6e6] rounded-[16px] py-3 text-[15px] font-[480] hover:bg-[#f9f9f9] transition-all hover:border-[#cccccc] active:scale-[0.98]"
                title="Sign in with GitHub"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>OR CONTINUE WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isSignUp && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="name" style={labelStyle}>Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white border border-[#e6e6e6] rounded-[16px] px-4 py-2.5 text-sm font-[330] outline-none focus:border-black transition-colors"
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border border-[#e6e6e6] rounded-[16px] px-4 py-2.5 text-sm font-[330] outline-none focus:border-black transition-colors"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border border-[#e6e6e6] rounded-[16px] px-4 py-2.5 text-sm font-[330] outline-none focus:border-black transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                background: "#c5b0f4",
                color: "#000000",
                fontSize: 15,
                fontWeight: 480,
                padding: "12px 24px",
                borderRadius: 9999,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
              className="hover:opacity-85 transition-opacity"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {cta}
            </button>
          </form>



          <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, fontWeight: 330, color: "#666" }}>
            {altText}{" "}
            <Link to={altLink} style={{ color: "#000000", fontWeight: 480, textDecoration: "none" }}>
              {altLabel}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Color Block - NAVY with Video Background */}
      <div className="hidden lg:flex flex-1 flex-col justify-center relative overflow-hidden" style={{ background: "#1f1d3d", color: "#ffffff", padding: "48px" }}>
         <video
           autoPlay
           loop
           muted
           playsInline
           className="absolute inset-0 w-full h-full object-cover opacity-70"
           style={{ pointerEvents: "none" }}
         >
           <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260422_191657_800d4e1f-7ab3-41af-90b6-9bd3039eb294.mp4" type="video/mp4" />
         </video>

         <div className="relative z-10" style={{ maxWidth: 480, margin: "0 auto" }}>
            <blockquote style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 340, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 32, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              "GAP VoicePilot replaced our 40-person SDR team with AI agents that book 3x more meetings."
            </blockquote>
         </div>
      </div>

    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 480,
  color: "#333",
  letterSpacing: "-0.01em",
};
