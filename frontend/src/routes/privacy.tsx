import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Shield, Lock, Eye, FileText } from 'lucide-react'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 64px", textAlign: "left" }}>
          <p style={eyebrowStyle}>LEGAL OVERVIEW</p>
          <h1 style={displayXlStyle}>Privacy Policy</h1>
          <p style={subheadStyle}>We believe privacy is a fundamental human right. Here is how we protect yours.</p>
          <p style={captionStyle}>LAST UPDATED: MAY 07, 2026</p>
        </section>

        {/* TL;DR SUMMARY - CREAM */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#f4ecd6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Shield size={20} />
              <h3 style={headlineStyle}>TL;DR (The simple version)</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
              <div>
                <h4 style={cardTitleStyle}>We don't sell data.</h4>
                <p style={bodySmStyle}>Your audio, transcripts, and metadata are yours. We never sell them to third parties.</p>
              </div>
              <div>
                <h4 style={cardTitleStyle}>Security is default.</h4>
                <p style={bodySmStyle}>All voice streams are encrypted end-to-end and stored with SOC2-grade security.</p>
              </div>
              <div>
                <h4 style={cardTitleStyle}>You're in control.</h4>
                <p style={bodySmStyle}>You can delete your data or export it at any time with a single click.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILED CONTENT - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "0 auto 96px", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 80 }}>
            {/* Table of Contents - Desktop Only */}
            <aside style={{ position: "sticky", top: 120, height: "fit-content", display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={captionStyle}>CONTENTS</p>
              <a href="#collection" style={navLinkStyle}>1. Data Collection</a>
              <a href="#usage" style={navLinkStyle}>2. Data Usage</a>
              <a href="#storage" style={navLinkStyle}>3. Storage & Security</a>
              <a href="#rights" style={navLinkStyle}>4. Your Rights</a>
              <a href="#cookies" style={navLinkStyle}>5. Cookies</a>
            </aside>

            {/* Legal Text */}
            <div style={{ maxWidth: 720 }}>
              <div id="collection" style={legalSectionStyle}>
                <h2 style={headlineStyle}>1. Information We Collect</h2>
                <p style={bodyStyle}>
                  To provide our voice AI services, we collect information that you provide directly to us. This includes account information (name, email), payment details, and the audio data you stream through our API.
                </p>
                <p style={bodyStyle}>
                  We also collect technical metadata such as IP addresses, device identifiers, and browser types to improve service reliability and detect fraud.
                </p>
              </div>

              <div id="usage" style={legalSectionStyle}>
                <h2 style={headlineStyle}>2. How We Use Information</h2>
                <p style={bodyStyle}>
                  We use the collected data to:
                </p>
                <ul style={listStyle}>
                  <li>Synthesize and process voice interactions in real-time.</li>
                  <li>Improve our AI models (only if you explicitly opt-in to training).</li>
                  <li>Provide customer support and resolve technical issues.</li>
                  <li>Comply with legal obligations and prevent misuse of the platform.</li>
                </ul>
              </div>

              <div id="storage" style={legalSectionStyle}>
                <h2 style={headlineStyle}>3. Storage & Security</h2>
                <div style={{ background: "#f7f7f5", padding: 32, borderRadius: 12, border: "1px solid #e6e6e6", marginBottom: 32 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <Lock size={18} />
                    <span style={captionStyle}>SECURITY PROTOCOL</span>
                  </div>
                  <p style={bodySmStyle}>
                    All data is encrypted in transit via TLS 1.3 and at rest via AES-256. We conduct regular penetration tests and maintain strict access controls (least-privilege) across our entire infrastructure.
                  </p>
                </div>
                <p style={bodyStyle}>
                  Audio recordings are deleted immediately after processing unless you have enabled "Transcript Logging" in your dashboard settings.
                </p>
              </div>

              <div id="rights" style={legalSectionStyle}>
                <h2 style={headlineStyle}>4. Your Data Rights</h2>
                <p style={bodyStyle}>
                  Regardless of your location, we provide the following rights to all users:
                </p>
                <ul style={listStyle}>
                  <li><strong>Access:</strong> Request a copy of all data we hold about you.</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format.</li>
                  <li><strong>Deletion:</strong> Request permanent deletion of your account and associated data.</li>
                  <li><strong>Correction:</strong> Update inaccurate or incomplete information.</li>
                </ul>
              </div>

              <div id="cookies" style={legalSectionStyle}>
                <h2 style={headlineStyle}>5. Cookies & Tracking</h2>
                <p style={bodyStyle}>
                  We use essential cookies for authentication and security. We do not use third-party advertising trackers or behavioral profiling cookies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/* ── Design Tokens ── */

const displayXlStyle: React.CSSProperties = {
  fontSize: 86,
  fontWeight: 340,
  lineHeight: 1.0,
  letterSpacing: "-1.72px",
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
  marginBottom: 16,
}

const headlineStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 540,
  lineHeight: 1.35,
  letterSpacing: "-0.26px",
  color: "#000000",
  marginBottom: 24,
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.45,
  color: "#000000",
  marginBottom: 8,
}

const bodyStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 320,
  lineHeight: 1.6,
  letterSpacing: "-0.26px",
  color: "rgba(0,0,0,0.85)",
  marginBottom: 24,
}

const bodySmStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 330,
  lineHeight: 1.5,
  letterSpacing: "-0.14px",
  color: "rgba(0,0,0,0.6)",
}

const captionStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "0.6px",
  color: "rgba(0,0,0,0.4)",
  marginBottom: 8,
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#666",
  textDecoration: "none",
  transition: "color 0.2s ease",
}

const sectionGapStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto 96px",
  padding: "0 24px",
}

const blockBaseStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 64,
}

const legalSectionStyle: React.CSSProperties = {
  marginBottom: 80,
  paddingBottom: 64,
  borderBottom: "1px solid #f1f1f1",
}

const listStyle: React.CSSProperties = {
  paddingLeft: 24,
  margin: "0 0 32px 0",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  fontSize: 18,
  fontWeight: 320,
  color: "rgba(0,0,0,0.85)",
}
