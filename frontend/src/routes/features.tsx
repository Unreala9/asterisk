import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import {
  Mic,
  Phone,
  Brain,
  Workflow,
  Lock,
  LineChart,
  Code,
  Headphones,
  Languages,
  ArrowRight
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — GAP VoicePilot Voice AI Platform" },
      {
        name: "description",
        content:
          "Explore GAP VoicePilot's voice AI features: agent studio, telephony, analytics, integrations, and enterprise security.",
      },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  {
    icon: Mic,
    title: "Natural voices",
    desc: "Choose from 100+ ultra-realistic voices, or clone your own with 60 seconds of audio.",
  },
  {
    icon: Brain,
    title: "Reasoning engine",
    desc: "Built on frontier LLMs with custom fine-tuning for conversational tasks.",
  },
  {
    icon: Phone,
    title: "Global telephony",
    desc: "Native SIP, Twilio, and direct PSTN. Local numbers in 50+ countries.",
  },
  {
    icon: Workflow,
    title: "Tool calling",
    desc: "Connect agents to your CRM, calendar, knowledge base, and any HTTP API.",
  },
  {
    icon: Lock,
    title: "Compliance-first",
    desc: "SOC 2 Type II, HIPAA, GDPR. PII redaction and on-prem deployment options.",
  },
  {
    icon: LineChart,
    title: "Real-time analytics",
    desc: "Live dashboards for call volume, sentiment, drop-off, and goal completion.",
  },
  {
    icon: Code,
    title: "Developer APIs",
    desc: "REST + WebSocket APIs, TypeScript & Python SDKs, and Terraform provider.",
  },
  {
    icon: Headphones,
    title: "Inbound + outbound",
    desc: "Handle support queues or run outbound campaigns at unlimited scale.",
  },
  {
    icon: Languages,
    title: "Multilingual",
    desc: "30+ languages with auto language detection mid-conversation.",
  },
];

const useCases = [
  {
    title: "Sales",
    desc: "Qualify leads, book meetings, and follow up automatically without dropping the ball.",
  },
  {
    title: "Support",
    desc: "Resolve tier-1 tickets 24/7 with human handoff context when needed.",
  },
  {
    title: "Operations",
    desc: "Automate appointment reminders, surveys, and critical outbound notifications.",
  },
];

function FeaturesPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      <main>
        
        {/* HERO */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(80px, 12vw, 120px) 24px clamp(40px, 8vw, 80px)", textAlign: "center" }}>
          <p style={eyebrowStyle}>Platform Features</p>
          <h1 style={{ ...displayXlStyle, marginBottom: 32 }}>
            A platform built for<br />production voice AI.
          </h1>
          <p style={{ fontSize: 20, fontWeight: 330, lineHeight: 1.45, letterSpacing: "-0.01em", color: "#333", maxWidth: 640, margin: "0 auto" }}>
            Everything from prototype to production scale. Designed for developers,
            trusted by enterprises.
          </p>
        </section>

        {/* CORE CAPABILITIES - LILAC BLOCK */}
        <section style={{ maxWidth: 1200, margin: "0 auto 96px", padding: "0 24px" }}>
          <div style={{ background: "#c5b0f4", borderRadius: 24, padding: "clamp(40px, 8vw, 64px) clamp(24px, 5vw, 48px)" }}>
            <p style={{ ...eyebrowStyle, color: "#3d2080" }}>CAPABILITIES</p>
            <h2 style={{ ...displayLgStyle, maxWidth: 600, marginBottom: 56 }}>
              The complete toolkit for intelligent voice.
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: "#ffffff", borderRadius: 16, padding: 32, border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 9999, background: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <f.icon size={20} strokeWidth={1.5} color="#000000" />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: 16, fontWeight: 330, lineHeight: 1.5, color: "#444" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES - NAVY BLOCK */}
        <section style={{ maxWidth: 1200, margin: "0 auto 96px", padding: "0 24px" }}>
          <div style={{ background: "#1f1d3d", borderRadius: 24, padding: "clamp(40px, 8vw, 64px) clamp(24px, 5vw, 48px)", color: "#ffffff" }}>
            <p style={{ ...eyebrowStyle, color: "rgba(255,255,255,0.45)" }}>USE CASES</p>
            <h2 style={{ ...displayLgStyle, marginBottom: 64, color: "#ffffff" }}>
              Built for every workflow.
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {useCases.map((u, i) => (
                <div key={i} style={{ padding: "32px 0", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  <h3 style={{ fontSize: 26, fontWeight: 540, letterSpacing: "-0.01em", marginBottom: 16 }}>{u.title}</h3>
                  <p style={{ fontSize: 18, fontWeight: 320, lineHeight: 1.5, color: "rgba(255,255,255,0.7)" }}>{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING CTA - WHITE CANVAS */}
        <section style={{ maxWidth: 1200, margin: "0 auto 96px", padding: "64px 24px", textAlign: "center", borderTop: "1px solid #e6e6e6" }}>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 340, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Ready to deploy your agent?
          </h2>
          <Link
            to="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#000000",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 480,
              padding: "14px 32px",
              borderRadius: 9999,
              textDecoration: "none",
            }}
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </section>

      </main>
      <Footer />
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
  color: "#000000",
};

const displayXlStyle: React.CSSProperties = {
  fontSize: "clamp(42px, 6vw, 86px)",
  fontWeight: 340,
  lineHeight: 1.0,
  letterSpacing: "-0.02em",
  color: "#000000",
};
