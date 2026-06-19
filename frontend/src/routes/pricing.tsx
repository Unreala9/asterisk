import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — GAP VoicePilot" },
      {
        name: "description",
        content:
          "Simple, usage-based pricing for voice AI agents. Start free with 1,000 minutes.",
      },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    desc: "For builders prototyping voice agents.",
    features: [
      "1,000 minutes/mo",
      "2 active agents",
      "Community support",
      "Basic analytics",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$299",
    period: "/mo",
    desc: "For teams running production traffic.",
    features: [
      "25,000 minutes/mo",
      "Unlimited agents",
      "Priority support",
      "Advanced analytics",
      "Custom voices",
      "Webhooks",
    ],
    cta: "Start trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For mission-critical deployments.",
    features: [
      "Unlimited minutes",
      "SLA & dedicated support",
      "On-prem & VPC",
      "SOC 2 / HIPAA",
      "Custom integrations",
      "Dedicated CSM",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Do unused minutes roll over?",
    a: "No, minutes are reset at the beginning of each billing cycle to keep pricing straightforward.",
  },
  {
    q: "Can I bring my own SIP trunk?",
    a: "Yes! The Enterprise plan supports BYOC (Bring Your Own Carrier) via SIP interconnects.",
  },
  {
    q: "What happens if I exceed my minutes?",
    a: "You'll be billed at a standard overage rate of $0.12 per additional minute on the Growth plan.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fees. You only pay the flat monthly rate and any overage charges you incur.",
  },
];

function PricingPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      <main>
        
        {/* HERO */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(80px, 12vw, 120px) 24px 64px", textAlign: "center" }}>
          <p style={eyebrowStyle}>Pricing</p>
          <h1 style={{ ...displayXlStyle, marginBottom: 32 }}>
            Simple, usage-based<br />pricing.
          </h1>
          <p style={{ fontSize: 20, fontWeight: 330, lineHeight: 1.45, letterSpacing: "-0.01em", color: "#333", maxWidth: 640, margin: "0 auto" }}>
            Pay only for what you use. No hidden fees. Cancel anytime.
          </p>
        </section>

        {/* PRICING CARDS - WHITE CANVAS */}
        <section style={{ maxWidth: 1200, margin: "0 auto 120px", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "stretch" }}>
            {tiers.map((t) => (
              <div
                key={t.name}
                style={{
                  background: t.highlight ? "#000000" : "#ffffff",
                  color: t.highlight ? "#ffffff" : "#000000",
                  borderRadius: 24,
                  padding: 40,
                  border: t.highlight ? "none" : "1px solid #e6e6e6",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {t.highlight && (
                  <div style={{ display: "inline-block", background: "#f3c9b6", color: "#000", fontSize: 11, fontFamily: "monospace", padding: "4px 12px", borderRadius: 9999, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, alignSelf: "flex-start" }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8, marginTop: t.highlight ? 0 : 20 }}>
                  {t.name}
                </h3>
                <p style={{ fontSize: 16, fontWeight: 330, color: t.highlight ? "rgba(255,255,255,0.7)" : "#666", marginBottom: 32, minHeight: 48 }}>
                  {t.desc}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 32 }}>
                  <span style={{ fontSize: 48, fontWeight: 340, letterSpacing: "-0.02em" }}>{t.price}</span>
                  <span style={{ fontSize: 16, fontWeight: 330, color: t.highlight ? "rgba(255,255,255,0.6)" : "#666" }}>{t.period}</span>
                </div>
                
                <Link
                  to="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: t.highlight ? "#ffffff" : "#f7f7f5",
                    color: t.highlight ? "#000000" : "#000000",
                    fontSize: 16,
                    fontWeight: 480,
                    padding: "14px 24px",
                    borderRadius: 9999,
                    textDecoration: "none",
                    marginBottom: 48,
                    border: t.highlight ? "none" : "1px solid #e6e6e6",
                  }}
                >
                  {t.cta}
                </Link>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  {t.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 16, fontWeight: 330 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 9999, background: t.highlight ? "rgba(255,255,255,0.15)" : "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <Check size={12} color={t.highlight ? "#ffffff" : "#1ea64a"} strokeWidth={3} />
                      </div>
                      <span style={{ color: t.highlight ? "#ffffff" : "#333" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 14, fontWeight: 330, color: "#666", marginTop: 32 }}>
            All plans include 99.99% uptime SLA · No setup fees · Cancel anytime
          </p>
        </section>

        {/* FAQ - LIME BLOCK */}
        <section style={{ maxWidth: 1200, margin: "0 auto 96px", padding: "0 24px" }}>
          <div style={{ background: "#dceeb1", borderRadius: 24, padding: "clamp(40px, 8vw, 80px) clamp(24px, 5vw, 64px)" }}>
            <p style={{ ...eyebrowStyle, color: "#4a6b20" }}>FAQ</p>
            <h2 style={{ ...displayLgStyle, marginBottom: 56, maxWidth: 500 }}>
              Questions about pricing?
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px 64px" }}>
              {faqs.map((faq, i) => (
                <div key={i}>
                  <h3 style={{ fontSize: 20, fontWeight: 540, letterSpacing: "-0.01em", marginBottom: 12 }}>{faq.q}</h3>
                  <p style={{ fontSize: 16, fontWeight: 330, lineHeight: 1.5, color: "#333" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
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
