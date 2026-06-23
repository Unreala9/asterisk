import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  Phone,
  Zap,
  BarChart3,
  Settings,
  MessageSquare,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import CardSwap, { Card } from "@/components/ui/CardSwap/CardSwap";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260422_191657_800d4e1f-7ab3-41af-90b6-9bd3039eb294.mp4";

const features = [
  {
    icon: Phone,
    label: "VOICE CALLING",
    title: "Outbound & Inbound at Scale",
    desc: "Zero-latency AI calls with ultra-realistic voice models that handle interruptions and context seamlessly.",
    block: "#dceeb1",
  },
  {
    icon: MessageSquare,
    label: "CONVERSATIONS",
    title: "Real-Time Understanding",
    desc: "Agents that comprehend hesitations, tone shifts, and nuanced context — just like a trained human rep.",
    block: "#c5b0f4",
  },
  {
    icon: Zap,
    label: "AUTOMATION",
    title: "Smart Workflow Triggers",
    desc: "Integrate with your CRM, fire webhooks, and automate follow-ups the moment a call ends.",
    block: "#f3c9b6",
  },
  {
    icon: BarChart3,
    label: "ANALYTICS",
    title: "Instant Conversation Insights",
    desc: "Intent analysis, sentiment scores, and full transcripts — surfaced in your dashboard in real time.",
    block: "#c8e6cd",
  },
  {
    icon: Settings,
    label: "CUSTOMIZATION",
    title: "Bespoke Agent Scripts",
    desc: "Train your AI on unique scripts, handle specific objections, and match your brand voice exactly.",
    block: "#f4ecd6",
  },
  {
    icon: Activity,
    label: "RELIABILITY",
    title: "24 / 7 Always On",
    desc: "Never miss a lead. Scale infinitely without additional headcount or infrastructure overhead.",
    block: "#efd4d4",
  },
];

const steps = [
  { n: "01", title: "Create Your Agent", desc: "Pick a voice, define the persona, and set your goals in minutes." },
  { n: "02", title: "Train with Data", desc: "Upload scripts, FAQs, and your knowledge base to shape the conversation." },
  { n: "03", title: "Launch Campaigns", desc: "Go live instantly — outbound, inbound, or fully automated workflows." },
];

const logos = [
  "Salesforce", "HubSpot", "Zendesk", "Twilio", "Stripe",
  "Slack", "Notion", "Zapier", "Monday", "Intercom",
];



gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const successSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (successSectionRef.current) {
        gsap.from(successSectionRef.current, {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: successSectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          }
        });
      }
    }, successSectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, s: any) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85;
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>

      {/* ── Transparent Navbar over video ── */}
      <div style={{ position: "relative", zIndex: 50 }}>
        <Navbar />
      </div>

      <main>

        {/* ═══════════════════════════════════════════════
            HERO — Retell-style Luminous Blue Card
        ═══════════════════════════════════════════════ */}
        <section style={{ padding: "3px", marginTop: "4.5%", background: "#ffffff" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(600px, 90vh, 860px)",
              borderRadius: 29,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: 110,
              background: "#050a18",
            }}
          >
            {/* Clear Background Video */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.85 }}>
              <video
                ref={videoRef}
                src={HERO_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Subtle scrim for text readability */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,10,24,0.4) 0%, rgba(5,10,24,0.2) 50%, rgba(5,10,24,0.6) 100%)" }} />
            </div>

            {/* Hero content */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                maxWidth: 1200,
                textAlign: "center",
                padding: "0 40px",
              }}
            >
              {/* Eyebrow */}
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.88)",
                  marginBottom: 20,
                }}
              >
                #1 AI Voice Agent Platform for Automating Calls
              </p>

              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(48px, 8vw, 112px)",
                  fontWeight: 300,
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  color: "#ffffff",
                  marginBottom: 0,
                }}
              >
                Meet your AI call<br />
                center from the<br />
                future.
              </h1>
            </div>

            {/* Bottom Corner Overlays */}
            <div style={{ position: "absolute", bottom: "clamp(24px, 5vw, 52px)", left: "clamp(20px, 5vw, 48px)", right: "clamp(20px, 5vw, 48px)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 3 }}>
              {/* Left: Rating & Description */}
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", gap: 3, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 1, color: "#ffffff" }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ fontSize: 14 }}>★</span>
                    ))}
                  </div>
                  <span style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>4.9</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 330, lineHeight: 1.55, color: "#ffffff", opacity: 0.92, maxWidth: 360 }}>
                  Build, deploy, and manage next-generation AI voice agents that sound human, execute tasks, and scale effortlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            style={{
              position: "absolute",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Scroll</span>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.25)", animation: "scrollPulse 2s ease-in-out infinite" }} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            MARQUEE STRIP — logos on light
        ═══════════════════════════════════════════════ */}
        <div
          style={{
            background: "#f6f3eb",
            color: "#000000",
            height: 84,
            padding: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            position: "relative",
            borderTop: "1px solid #e6e6e6",
            borderBottom: "1px solid #e6e6e6",
          }}
        >
          {/* Label - Fixed on left */}
          <div className="hidden md:flex" style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 20,
            background: "#f4ecd6",
            paddingLeft: 48,
            paddingRight: 40,
            alignItems: "center",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            color: "rgba(0,0,0,0.5)"
          }}>
            TRUSTED BY
          </div>

          {/* Edge Fading Masks */}
          <div className="absolute inset-y-0 left-0 w-20 md:w-80 bg-gradient-to-r from-[#f4ecd6] via-[#f4ecd6]/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-[#f4ecd6] to-transparent z-10 pointer-events-none" />

          <div
            className="marquee-inner pl-0 md:pl-[240px]"
            style={{
              display: "flex",
              gap: 96,
              whiteSpace: "nowrap",
              animation: "marquee 60s linear infinite",
              alignItems: "center",
            }}
          >
            {[...logos, ...logos, ...logos, ...logos].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 96 }}>
                <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={`https://www.vectorlogo.zone/logos/${l.toLowerCase()}/${l.toLowerCase()}-ar21.svg`}
                    alt={l}
                    style={{
                      height: "100%",
                      width: "auto",
                      maxWidth: 160,
                      filter: "grayscale(1) brightness(0)",
                      opacity: 0.8,
                      objectFit: "contain"
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const fallback = (e.currentTarget as HTMLElement).parentElement?.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                </div>
                <span style={{
                  display: "none",
                  fontWeight: 600,
                  color: "#000",
                  opacity: 0.8,
                  fontSize: 16,
                  fontFamily: "'Inter', sans-serif"
                }}>{l}</span>
                <span style={{ color: "rgba(0,0,0,0.1)", fontSize: 24, fontWeight: 300 }}>/</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            HOW IT WORKS — white canvas section
        ═══════════════════════════════════════════════ */}
        <section className="mx-auto max-w-[1200px] py-16 md:py-24 px-4 md:px-6">
          <p style={eyebrowStyle}>HOW IT WORKS</p>
          <h2 style={{ ...displayLgStyle, marginBottom: 64 }}>
            From idea to live agent
            <br />in three steps.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  background: i % 2 === 0 ? "#f7f7f5" : "#ffffff",
                  border: "1px solid #e6e6e6",
                  borderRadius: 24,
                  padding: 40,
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 13, letterSpacing: "0.1em", color: "#999", textTransform: "uppercase" }}>{s.n}</span>
                <h3 style={{ fontSize: 24, fontWeight: 540, letterSpacing: "-0.02em", margin: "16px 0 12px" }}>{s.title}</h3>
                <p style={{ fontSize: 17, fontWeight: 320, lineHeight: 1.55, color: "#444" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            FEATURES — LIME color block
        ═══════════════════════════════════════════════ */}
        <section className="mx-auto max-w-[1200px] mb-24 px-4 md:px-6">
          <div
            className="bg-[#dceeb1] rounded-[24px] py-12 px-6 md:py-16 md:px-12"
          >
            <p style={{ ...eyebrowStyle, color: "#4a6b20" }}>CAPABILITIES</p>
            <h2 style={{ ...displayLgStyle, maxWidth: "none", marginBottom: 40 }} className="md:max-w-[520px]">
              Everything your voice team needs.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.60)",
                    borderRadius: 16,
                    padding: 28,
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <f.icon size={20} strokeWidth={1.5} />
                    <span style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555" }}>{f.label}</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 15, fontWeight: 320, lineHeight: 1.55, color: "#333" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            STATS — NAVY color block
        ═══════════════════════════════════════════════ */}
        <section className="mx-auto max-w-[1200px] mb-24 px-4 md:px-6">
          <div
            style={{
              background: "#1f1d3d",
              borderRadius: 24,
              padding: "clamp(40px, 8vw, 64px) clamp(24px, 5vw, 48px)",
              color: "#ffffff",
            }}
          >
            <p style={{ ...eyebrowStyle, color: "rgba(255,255,255,0.45)" }}>BY THE NUMBERS</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 340, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 56, maxWidth: 480 }}>
              Trusted by teams shipping at scale.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48 }}>
              {[
                { n: "2M+", label: "Calls Handled" },
                { n: "99.8%", label: "Uptime SLA" },
                { n: "<100ms", label: "Response Latency" },
                { n: "40+", label: "CRM Integrations" },
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 340, letterSpacing: "-0.02em", marginBottom: 8 }}>{stat.n}</div>
                  <div style={{ fontSize: 15, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.50)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            DEVELOPER — CORAL color block
        ═══════════════════════════════════════════════ */}
        <section className="mx-auto max-w-[1200px] mb-24 px-4 md:px-6">
          <div className="bg-[#f3c9b6] rounded-[24px] py-12 px-6 md:py-16 md:px-12">
            <p style={{ ...eyebrowStyle, color: "#8b4f35" }}>FOR DEVELOPERS</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
              <div style={{ flex: "1 1 340px" }}>
                <h2 style={{ ...displayLgStyle, marginBottom: 24, maxWidth: 440 }}>
                  Build with APIs that make sense.
                </h2>
                <p style={{ fontSize: 18, fontWeight: 320, lineHeight: 1.55, color: "#542a17", marginBottom: 32 }}>
                  Integrate voice capabilities directly into your application with our robust REST and WebSocket APIs. No complex telecom knowledge required.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(255,255,255,0.4)", padding: "8px 16px", borderRadius: 9999, fontSize: 14, fontWeight: 540 }}>Node.js</span>
                  <span style={{ background: "rgba(255,255,255,0.4)", padding: "8px 16px", borderRadius: 9999, fontSize: 14, fontWeight: 540 }}>Python</span>
                  <span style={{ background: "rgba(255,255,255,0.4)", padding: "8px 16px", borderRadius: 9999, fontSize: 14, fontWeight: 540 }}>Go</span>
                  <span style={{ background: "rgba(255,255,255,0.4)", padding: "8px 16px", borderRadius: 9999, fontSize: 14, fontWeight: 540 }}>Webhooks</span>
                </div>
              </div>
              <div style={{ flex: "1 1 400px", background: "#1e1e1e", padding: 32, borderRadius: 16, color: "#d4d4d4", fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 13, lineHeight: 1.6, overflowX: "auto" }}>
                <span style={{ color: "#569cd6" }}>const</span> client <span style={{ color: "#d4d4d4" }}>=</span> <span style={{ color: "#569cd6" }}>new</span> <span style={{ color: "#4ec9b0" }}>GAPVoicePilot</span>(<span style={{ color: "#ce9178" }}>'api_key'</span>);<br /><br />
                <span style={{ color: "#569cd6" }}>await</span> client.<span style={{ color: "#dcdcaa" }}>calls</span>.<span style={{ color: "#dcdcaa" }}>create</span>({`{`}<br />
                &nbsp;&nbsp;agent_id: <span style={{ color: "#ce9178" }}>'agt_123'</span>,<br />
                &nbsp;&nbsp;to: <span style={{ color: "#ce9178" }}>'+15550100'</span>,<br />
                &nbsp;&nbsp;context: {`{`}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;name: <span style={{ color: "#ce9178" }}>'Alice'</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;topic: <span style={{ color: "#ce9178" }}>'renewal'</span><br />
                &nbsp;&nbsp;{`}`}<br />
                {`}`});
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            TEMPLATES — WHITE canvas
        ═══════════════════════════════════════════════ */}
        <section className="mx-auto max-w-[1200px] mb-24 px-4 md:px-6">
          <p style={eyebrowStyle}>TEMPLATES</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
            <h2 style={{ ...displayLgStyle, marginBottom: 0 }}>
              Start with a proven model.
            </h2>
            <Link to="/features" style={{ fontSize: 16, fontWeight: 480, textDecoration: "none", color: "#000000", display: "flex", alignItems: "center", gap: 4 }}>
              Explore all templates <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { title: "Real Estate Assistant", tags: ["Inbound", "Booking"], desc: "Answers FAQ, qualifies buyers, and schedules viewings directly to your calendar." },
              { title: "Customer Support", tags: ["Inbound", "Resolution"], desc: "Handles tier-1 tickets 24/7 with seamless handoff to human agents for complex issues." },
              { title: "Sales SDR", tags: ["Outbound", "Lead Gen"], desc: "Follows up on webinar leads, pitches your product, and books demo calls." },
            ].map((t, i) => (
              <div key={i} style={{ background: "#f7f7f5", borderRadius: 16, padding: 32, border: "1px solid #e6e6e6", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform="none"}>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", background: "#ffffff", padding: "4px 10px", borderRadius: 9999, border: "1px solid #e6e6e6", color: "#666" }}>{tag}</span>
                  ))}
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 540, letterSpacing: "-0.01em", marginBottom: 12 }}>{t.title}</h3>
                <p style={{ fontSize: 16, fontWeight: 330, lineHeight: 1.5, color: "#444" }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SUCCESS STORIES — PREMIUM LIGHT SHOWCASE (CREAM)
        ═══════════════════════════════════════════════ */}
        <section ref={successSectionRef} className="mx-auto max-w-[1240px] mb-32 px-4 md:px-6">
          <div 
            className="min-h-auto md:min-h-[720px]"
            style={{ 
              background: "#f4ecd6",
              borderRadius: 24,
              border: "1px solid #e6e6e6",
              padding: "clamp(40px, 8vw, 100px) clamp(24px, 5vw, 64px)",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)"
            }}
          >
            {/* Background Texture / Decoration */}
            <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)", pointerEvents: "none" }} />
            
            {/* Left Content */}
            <div style={{ maxWidth: "520px", position: "relative", zIndex: 10 }}>
              <div style={{ ...eyebrowStyle, color: "#8a7b5e", display: "flex", alignItems: "center", gap: 10 }}>
                <Activity size={14} />
                <span>GLOBAL DEPLOYMENT REPORT 2024</span>
              </div>

              <div style={{ ...displayLgStyle, fontSize: "clamp(80px, 10vw, 120px)", color: "#1a1a1a", marginBottom: 8, letterSpacing: "-0.05em" }}>
                2,500+
              </div>

              <div style={{ fontSize: 24, fontWeight: 320, color: "#2a2a2a", marginBottom: 32, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                AI Voice Agents deployed with human-level precision.
              </div>

              <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, color: "#5a5a5a", marginBottom: 48, maxWidth: 380 }}>
                From high-volume customer support to complex lead qualification, our agents handle millions of minutes with zero latency.
              </p>

              {/* Logo / Branding */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 20px", background: "rgba(255,255,255,0.5)", border: "1px solid #e6e6e6", borderRadius: 16, width: "fit-content" }}>
                <div style={{ width: 40, height: 40, background: "#000", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Phone size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#000", lineHeight: 1 }}>GAP</div>
                  <div style={{ fontSize: 10, color: "#666", letterSpacing: "0.1em", marginTop: 2 }}>VOICEPILOT</div>
                </div>
              </div>
            </div>

            {/* Right Side - Light CardSwap Collage */}
            <div className="hidden lg:block" style={{ position: "absolute", right: "2%", bottom: "10%", width: "550px", height: "450px" }}>
              <CardSwap
                width={440}
                height={340}
                cardDistance={40}
                verticalDistance={60}
                delay={5000}
                pauseOnHover={true}
                skewAmount={4}
              >
                {/* Light Card 1 */}
                <Card style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6", padding: 0, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.06)" }}>
                  <div style={{ padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                         <Zap size={18} color="#000" />
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 500, color: "#000", letterSpacing: "-0.01em" }}>High-Volume Inbound</span>
                    </div>
                    <p style={{ fontSize: 15, color: "#666", lineHeight: 1.5, marginBottom: 24 }}>
                      Scale your support team instantly. Handle thousands of simultaneous calls with no hold times.
                    </p>
                  </div>
                  <div style={{ flex: 1, margin: "0 20px 20px", borderRadius: 12, border: "1px solid #eeeeee", overflow: "hidden", height: "140px" }}>
                     <img src="/inbound_dashboard_mockup_1778244349616.png" alt="Inbound Dashboard" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </Card>

                {/* Light Card 2 */}
                <Card style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6", padding: 0, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.06)" }}>
                  <div style={{ padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                         <Settings size={18} color="#000" />
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 500, color: "#000", letterSpacing: "-0.01em" }}>Objection Handling</span>
                    </div>
                    <p style={{ fontSize: 15, color: "#666", lineHeight: 1.5, marginBottom: 24 }}>
                      Advanced reasoning engines allow agents to pivot and resolve customer concerns in real-time.
                    </p>
                  </div>
                  <div style={{ flex: 1, margin: "0 20px 20px", borderRadius: 12, border: "1px solid #eeeeee", overflow: "hidden", height: "140px" }}>
                     <img src="/objection_handling_mockup_1778244364528.png" alt="Objection Handling" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </Card>

                {/* Light Card 3 */}
                <Card style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6", padding: 0, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.06)" }}>
                  <div style={{ padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                         <BarChart3 size={18} color="#000" />
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 500, color: "#000", letterSpacing: "-0.01em" }}>Sentiment Analysis</span>
                    </div>
                    <p style={{ fontSize: 15, color: "#666", lineHeight: 1.5, marginBottom: 24 }}>
                      Automatically track customer mood and intent across every single interaction.
                    </p>
                  </div>
                  <div style={{ flex: 1, margin: "0 20px 20px", borderRadius: 12, border: "1px solid #eeeeee", overflow: "hidden", height: "140px" }}>
                     <img src="/sentiment_analysis_mockup_1778244382278.png" alt="Sentiment Analysis" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            PRICING TEASER — LILAC color block
        ═══════════════════════════════════════════════ */}
        <section className="mx-auto max-w-[1200px] mb-24 px-4 md:px-6">
          <div className="bg-[#c5b0f4] rounded-[24px] py-12 px-6 md:py-16 md:px-12">
            <p style={{ ...eyebrowStyle, color: "#3d2080" }}>PRICING</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-end", marginBottom: 48 }}>
              <h2 style={{ ...displayLgStyle, flex: "1 1 340px", marginBottom: 0 }}>
                Simple pricing,
                <br />no surprises.
              </h2>
              <p style={{ flex: "1 1 300px", fontSize: 18, fontWeight: 320, lineHeight: 1.55, color: "#2a1060" }}>
                Start for free and scale as your volume grows. Every plan includes unlimited agents and full analytics.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {[
                { name: "Basic", price: "$49", period: "/mo", features: ["500 minutes", "1 Agent", "Basic Analytics"] },
                { name: "Pro", price: "$199", period: "/mo", features: ["5,000 minutes", "5 Agents", "CRM Integrations", "Priority Support"], highlight: true },
                { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited minutes", "Unlimited Agents", "Dedicated Server", "24/7 SLA"] },
              ].map((tier, i) => (
                <div
                  key={i}
                  style={{
                    background: tier.highlight ? "#000000" : "rgba(255,255,255,0.55)",
                    color: tier.highlight ? "#ffffff" : "#000000",
                    borderRadius: 20,
                    padding: 32,
                    border: tier.highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={{ fontSize: 13, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, opacity: 0.6 }}>{tier.name}</div>
                  <div style={{ fontSize: 42, fontWeight: 340, letterSpacing: "-0.02em", marginBottom: 4 }}>
                    {tier.price}<span style={{ fontSize: 18, fontWeight: 320 }}>{tier.period}</span>
                  </div>
                  <div style={{ borderTop: tier.highlight ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)", margin: "20px 0" }} />
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {tier.features.map((f, j) => (
                      <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 320 }}>
                        <CheckCircle2 size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={session ? "/dashboard" : "/signup"}
                    style={{
                      display: "block",
                      textAlign: "center",
                      background: tier.highlight ? "#ffffff" : "#1f1d3d",
                      color: tier.highlight ? "#000000" : "#ffffff",
                      fontSize: 15,
                      fontWeight: 480,
                      padding: "10px 20px",
                      borderRadius: 9999,
                      textDecoration: "none",
                    }}
                  >
                    {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            CTA — black closing section
        ═══════════════════════════════════════════════ */}
        <section style={{ background: "#000000", color: "#ffffff", padding: "96px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: 24 }}>GET STARTED TODAY</p>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 340, letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 20, maxWidth: 700, margin: "0 auto 20px" }}>
            Build your AI workforce, starting now.
          </h2>
          <p style={{ fontSize: 18, fontWeight: 320, color: "rgba(255,255,255,0.60)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.55 }}>
            Join thousands of teams scaling communications without scaling headcount.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to={session ? "/dashboard" : "/signup"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                color: "#000000",
                fontSize: 16,
                fontWeight: 480,
                padding: "14px 32px",
                borderRadius: 9999,
                textDecoration: "none",
              }}
            >
              {session ? "Go to Dashboard" : "Deploy Your First Agent"}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 480,
                padding: "14px 32px",
                borderRadius: 9999,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              Learn More
            </Link>
          </div>
        </section>

      </main>

      <Footer />

      {/* ── Global keyframe animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50%       { opacity: 0.8; transform: scaleY(1.15); }
        }
        @media (max-width: 560px) {
          .marquee-inner { animation-duration: 14s !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Shared style objects ── */
const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#999",
  marginBottom: 16,
};

const displayLgStyle: React.CSSProperties = {
  fontSize: "clamp(32px, 4vw, 56px)",
  fontWeight: 340,
  letterSpacing: "-0.02em",
  lineHeight: 1.08,
  marginBottom: 24,
};
