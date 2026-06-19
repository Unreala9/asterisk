import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Sparkles, Zap, Bug, Box, Activity, Users } from 'lucide-react'

export const Route = createFileRoute('/changelog')({
  component: ChangelogPage,
})

function ChangelogPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 96px", textAlign: "left" }}>
          <p style={eyebrowStyle}>SYSTEM LOG</p>
          <h1 style={displayXlStyle}>Evolution of <br />VoicePilot</h1>
          <p style={subheadStyle}>A rigorous record of our progress, from fundamental infrastructure to joyful interactions.</p>
        </section>

        {/* LATEST RELEASE - LILAC */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#c5b0f4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 64 }}>
              <div>
                <p style={{ ...eyebrowStyle, color: "#3d2080" }}>LATEST RELEASE</p>
                <h2 style={{ fontSize: 64, fontWeight: 340, letterSpacing: "-0.015em", lineHeight: 1 }}>v1.2.0</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3d2080", fontSize: 14 }}>MAY 07, 2026</p>
                <div style={statusPillStyle}>STABLE</div>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32 }}>
              <div style={changeCardStyle}>
                <Sparkles size={20} color="#3d2080" style={{ marginBottom: 16 }} />
                <h3 style={headlineStyle}>Multilingual Nuance</h3>
                <p style={bodyStyle}>Expanded to 12 new regions with accent-specific synthesis, allowing for localized emotional resonance.</p>
              </div>
              <div style={changeCardStyle}>
                <Zap size={20} color="#3d2080" style={{ marginBottom: 16 }} />
                <h3 style={headlineStyle}>Low-Latency Core</h3>
                <p style={bodyStyle}>Refactored our streaming engine to achieve sub-500ms response times, eliminating "voice lag" entirely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BREAK - MINT */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#c8e6cd", textAlign: "center" }}>
            <p style={eyebrowStyle}>BY THE NUMBERS</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "64px 120px", marginTop: 48 }}>
              <div>
                <h4 style={{ fontSize: 72, fontWeight: 340, letterSpacing: "-0.03em" }}>48k</h4>
                <p style={bodySmStyle}>Commits Pushed</p>
              </div>
              <div>
                <h4 style={{ fontSize: 72, fontWeight: 340, letterSpacing: "-0.03em" }}>99.9%</h4>
                <p style={bodySmStyle}>Uptime Maintained</p>
              </div>
              <div>
                <h4 style={{ fontSize: 72, fontWeight: 340, letterSpacing: "-0.03em" }}>12ms</h4>
                <p style={bodySmStyle}>Jitter Reduced</p>
              </div>
            </div>
          </div>
        </section>

        {/* PREVIOUS - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "96px auto", padding: "0 24px" }}>
          <div style={{ borderTop: "1px solid #e6e6e6", paddingTop: 64 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              <div>
                <p style={eyebrowStyle}>STABLE RELEASE</p>
                <h2 style={{ fontSize: 48, fontWeight: 340, letterSpacing: "-0.02em" }}>v1.1.0</h2>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#999" }}>APR 22, 2026</p>
            </div>
            
            <div style={{ display: "grid", gap: 32 }}>
              <div style={lineItemStyle}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                  <Box size={16} />
                  <span style={captionStyle}>INFRASTRUCTURE</span>
                </div>
                <h3 style={headlineStyle}>Elastic Knowledge Base</h3>
                <p style={bodyStyle}>Vector-indexed document processing for agents to recall complex business logic instantly.</p>
              </div>
              <div style={lineItemStyle}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                  <Bug size={16} />
                  <span style={captionStyle}>STABILITY</span>
                </div>
                <h3 style={headlineStyle}>Concurrent Stream Handlers</h3>
                <p style={bodyStyle}>Fixed a critical race condition in high-concurrency environments during dashboard refreshes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* INFRASTRUCTURE STATUS - CORAL */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#f3c9b6" }}>
            <div style={{ maxWidth: 800 }}>
              <p style={eyebrowStyle}>INFRASTRUCTURE</p>
              <h2 style={displayLgStyle}>Built for Reliability</h2>
              <p style={{ ...subheadStyle, marginBottom: 48 }}>We monitor our systems 24/7 to ensure your voice agents never miss a beat.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div style={statusItemStyle}>
                  <Activity size={20} style={{ marginBottom: 12 }} />
                  <h4 style={headlineStyle}>Edge Global Network</h4>
                  <p style={bodySmStyle}>24 Regional points of presence for global low-latency.</p>
                </div>
                <div style={statusItemStyle}>
                  <Users size={20} style={{ marginBottom: 12 }} />
                  <h4 style={headlineStyle}>Compliance Ready</h4>
                  <p style={bodySmStyle}>SOC2 Type II and HIPAA compliant infrastructure.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MONTHLY RECAP - LIME */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#dceeb1" }}>
            <p style={eyebrowStyle}>MONTHLY RECAP</p>
            <h2 style={displayLgStyle}>April 2026</h2>
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 64 }}>
              <div>
                <h3 style={headlineStyle}>Product Velocity</h3>
                <p style={bodyStyle}>14 Features shipped, 42 bug fixes deployed, and 12,000 agents successfully onboarded.</p>
              </div>
              <div>
                <h3 style={headlineStyle}>Ecosystem Growth</h3>
                <p style={bodyStyle}>New integrations with Zapier and Make.com launched to automate voice-to-workflow pipelines.</p>
              </div>
              <div>
                <h3 style={headlineStyle}>User Feedback</h3>
                <p style={bodyStyle}>94% CSAT score for agent naturalness, a new record for our synthesis engine.</p>
              </div>
            </div>
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

const captionStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "0.6px",
  color: "rgba(0,0,0,0.5)",
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
  boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
}

const changeCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.45)",
  borderRadius: 20,
  padding: 40,
  border: "1px solid rgba(0,0,0,0.05)",
}

const lineItemStyle: React.CSSProperties = {
  paddingBottom: 40,
  borderBottom: "1px solid #f1f1f1",
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
  marginTop: 8,
}

const statusItemStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.25)",
  padding: 32,
  borderRadius: 20,
  border: "1px solid rgba(0,0,0,0.05)",
}
