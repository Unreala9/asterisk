import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Rocket, Target, Map, Layers, Share2, MessageSquare, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/roadmap')({
  component: RoadmapPage,
})

function RoadmapPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 96px", textAlign: "left" }}>
          <p style={eyebrowStyle}>THE JOURNEY</p>
          <h1 style={displayXlStyle}>Product <br />Vision 2026</h1>
          <p style={subheadStyle}>Our roadmap is an open dialogue. We're building the future of voice intelligence, one breakthrough at a time.</p>
        </section>

        {/* IN PROGRESS - LILAC */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#c5b0f4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
              <div style={statusPillStyle}>ACTIVE NOW</div>
              <p style={{ ...eyebrowStyle, color: "#3d2080", marginBottom: 0 }}>Q2 2026</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 48 }}>
              <div>
                <Rocket size={32} color="#3d2080" style={{ marginBottom: 24 }} />
                <h3 style={displayLgSmallStyle}>Emotional <br />Intelligence Core</h3>
                <p style={bodyStyle}>Developing real-time sentiment mirroring so agents can detect frustration or joy and adjust their tone dynamically.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={itemCardStyle}>
                  <h4 style={headlineStyle}>CRM Native Sync</h4>
                  <p style={bodySmStyle}>Automated ticket creation and field updates for Salesforce and HubSpot.</p>
                </div>
                <div style={itemCardStyle}>
                  <h4 style={headlineStyle}>Ultra-Low Jitter Engine</h4>
                  <p style={bodySmStyle}>Achieving perfect audio stability even on unreliable 3G/4G networks.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLANNED - PINK */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#efd4d4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
              <div style={{ ...statusPillStyle, background: "#8b3535" }}>PLANNED</div>
              <p style={{ ...eyebrowStyle, color: "#8b3535", marginBottom: 0 }}>Q3 2026</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
              <div style={roadmapDetailStyle}>
                <Target size={24} color="#8b3535" style={{ marginBottom: 16 }} />
                <h4 style={headlineStyle}>Voice Designer Studio</h4>
                <p style={bodySmStyle}>A visual interface to sculpt agent personalities, pitch, and speech cadence with clinical precision.</p>
              </div>
              <div style={roadmapDetailStyle}>
                <Layers size={24} color="#8b3535" style={{ marginBottom: 16 }} />
                <h4 style={headlineStyle}>Campaign Architect</h4>
                <p style={bodySmStyle}>Schedule multi-touch outbound voice campaigns with intelligent follow-up logic and A/B testing.</p>
              </div>
              <div style={roadmapDetailStyle}>
                <Share2 size={24} color="#8b3535" style={{ marginBottom: 16 }} />
                <h4 style={headlineStyle}>Open API v2.0</h4>
                <p style={bodySmStyle}>GraphQL-powered endpoints for deeper control over agent lifecycles and real-time audio streams.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRIORITIZATION - NAVY */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#1f1d3d", color: "#ffffff" }}>
            <p style={{ ...eyebrowStyle, color: "rgba(255,255,255,0.4)" }}>STRATEGY</p>
            <h2 style={{ ...displayLgStyle, color: "#ffffff" }}>How we prioritize.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginTop: 48 }}>
              <div>
                <p style={{ ...bodyStyle, color: "#ffffff", fontSize: 24, lineHeight: 1.4 }}>
                  We prioritize features that move the needle on **humanity**. If it makes an agent sound more real, or feel more empathetic, it goes to the top of the list.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                <div>
                  <h4 style={{ ...headlineStyle, color: "#ffffff" }}>User-Led Growth</h4>
                  <p style={{ ...bodySmStyle, color: "rgba(255,255,255,0.7)" }}>We interview 50+ users every month to understand the friction points in their voice workflows.</p>
                </div>
                <div>
                  <h4 style={{ ...headlineStyle, color: "#ffffff" }}>Latency-First</h4>
                  <p style={{ ...bodySmStyle, color: "rgba(255,255,255,0.7)" }}>Every new feature must pass a rigorous latency audit. If it adds more than 20ms, it's back to the lab.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM - MINT */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#c8e6cd" }}>
            <p style={eyebrowStyle}>ECOSYSTEM</p>
            <h2 style={displayLgStyle}>Growing the Network</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 48 }}>
              {['Zendesk', 'Intercom', 'Slack', 'Twilio', 'Zapier', 'Make.com', 'Segment', 'Amplitude'].map(tool => (
                <div key={tool} style={toolBadgeStyle}>{tool}</div>
              ))}
            </div>
          </div>
        </section>

        {/* FEEDBACK CTA - CREAM */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#f4ecd6", textAlign: "center" }}>
            <MessageSquare size={48} style={{ marginBottom: 32, margin: "0 auto" }} />
            <h2 style={displayLgStyle}>Have a feature idea?</h2>
            <p style={{ ...subheadStyle, margin: "0 auto 48px" }}>Join our community and help shape the next chapter of VoicePilot.</p>
            <button style={pillButtonStyle}>
              Share Feedback <ChevronRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/* ── Design Tokens (DESIGN-figma.md) ── */

const displayXlStyle: React.CSSProperties = {
  fontSize: 86,
  fontWeight: 340,
  lineHeight: 1.0,
  letterSpacing: "-1.72px",
  color: "#000000",
  marginBottom: 32,
}

const displayLgStyle: React.CSSProperties = {
  fontSize: 64,
  fontWeight: 340,
  lineHeight: 1.1,
  letterSpacing: "-0.96px",
  color: "#000000",
  marginBottom: 32,
}

const displayLgSmallStyle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 340,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  color: "#000000",
  marginBottom: 24,
}

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.3,
  letterSpacing: "0.54px",
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.4)",
  marginBottom: 24,
}

const subheadStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 340,
  lineHeight: 1.35,
  letterSpacing: "-0.26px",
  color: "#111",
  maxWidth: 800,
}

const headlineStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 540,
  lineHeight: 1.35,
  letterSpacing: "-0.26px",
  color: "#000000",
}

const bodyStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 320,
  lineHeight: 1.45,
  letterSpacing: "-0.26px",
  color: "rgba(0,0,0,0.85)",
}

const bodySmStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 330,
  lineHeight: 1.45,
  letterSpacing: "-0.14px",
  color: "rgba(0,0,0,0.6)",
}

/* ── Layout Components ── */

const sectionGapStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto 96px",
  padding: "0 24px",
}

const blockBaseStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 80,
}

const itemCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.4)",
  padding: 32,
  borderRadius: 20,
  border: "1px solid rgba(0,0,0,0.05)",
}

const roadmapDetailStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.3)",
  padding: 40,
  borderRadius: 24,
  border: "1px solid rgba(0,0,0,0.05)",
}

const statusPillStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#000000",
  color: "#ffffff",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "'JetBrains Mono', monospace",
  padding: "4px 10px",
  borderRadius: 9999,
}

const toolBadgeStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.5)",
  padding: "12px 24px",
  borderRadius: 9999,
  fontSize: 16,
  fontWeight: 480,
  border: "1px solid rgba(0,0,0,0.05)",
}

const pillButtonStyle: React.CSSProperties = {
  background: "#000000",
  color: "#ffffff",
  border: "none",
  borderRadius: 9999,
  padding: "16px 32px",
  fontSize: 18,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
}
