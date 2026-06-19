import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { FileText, AlertCircle, CheckCircle2, Scale } from 'lucide-react'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 64px", textAlign: "left" }}>
          <p style={eyebrowStyle}>AGREEMENT</p>
          <h1 style={displayXlStyle}>Terms of <br />Service</h1>
          <p style={subheadStyle}>The rules for using GAP VoicePilot. Transparent, fair, and clear.</p>
          <p style={captionStyle}>LAST UPDATED: MAY 07, 2026</p>
        </section>

        {/* QUICK HIGHLIGHTS - LIME */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#dceeb1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Scale size={20} />
              <h3 style={headlineStyle}>At a glance</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
              <div style={highlightItemStyle}>
                <CheckCircle2 size={18} color="#1ea64a" />
                <p style={bodySmStyle}>You own the rights to all audio produced by your agents.</p>
              </div>
              <div style={highlightItemStyle}>
                <CheckCircle2 size={18} color="#1ea64a" />
                <p style={bodySmStyle}>You are responsible for obtaining consent from callers.</p>
              </div>
              <div style={highlightItemStyle}>
                <AlertCircle size={18} color="#000" />
                <p style={bodySmStyle}>Spamming or fraudulent use will result in instant termination.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILED CONTENT - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "0 auto 96px", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 80 }}>
            {/* Table of Contents */}
            <aside style={{ position: "sticky", top: 120, height: "fit-content", display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={captionStyle}>SECTIONS</p>
              <a href="#acceptance" style={navLinkStyle}>1. Acceptance</a>
              <a href="#usage" style={navLinkStyle}>2. Acceptable Use</a>
              <a href="#billing" style={navLinkStyle}>3. Billing & Subs</a>
              <a href="#intellectual" style={navLinkStyle}>4. Intellectual Property</a>
              <a href="#liability" style={navLinkStyle}>5. Liability</a>
            </aside>

            {/* Legal Text */}
            <div style={{ maxWidth: 720 }}>
              <div id="acceptance" style={legalSectionStyle}>
                <h2 style={headlineStyle}>1. Acceptance of Terms</h2>
                <p style={bodyStyle}>
                  By creating an account or using GAP VoicePilot, you agree to be bound by these Terms of Service. If you are using the services on behalf of an organization, you are agreeing to these Terms for that organization and promising that you have the authority to bind that organization.
                </p>
              </div>

              <div id="usage" style={legalSectionStyle}>
                <h2 style={headlineStyle}>2. Acceptable Use Policy</h2>
                <p style={bodyStyle}>
                  You agree not to misuse the GAP VoicePilot services. For example, you must not:
                </p>
                <ul style={listStyle}>
                  <li>Use the services to generate or transmit spam or illegal content.</li>
                  <li>Impersonate individuals or entities without explicit authorization.</li>
                  <li>Engage in any activity that interferes with or disrupts the services.</li>
                  <li>Attempt to reverse engineer or extract the source code of our models.</li>
                </ul>
                <div style={{ background: "#fff9e6", border: "1px solid #ffeeba", padding: 24, borderRadius: 12, marginTop: 24 }}>
                  <p style={{ ...bodySmStyle, color: "#856404" }}>
                    <strong>IMPORTANT:</strong> Users must comply with all local and international laws regarding call recording and telemarketing, including the TCPA and GDPR.
                  </p>
                </div>
              </div>

              <div id="billing" style={legalSectionStyle}>
                <h2 style={headlineStyle}>3. Billing & Subscriptions</h2>
                <p style={bodyStyle}>
                  Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
                </p>
                <p style={bodyStyle}>
                  You may cancel your Subscription at any time through your dashboard settings. Refunds are processed according to our standard refund policy.
                </p>
              </div>

              <div id="intellectual" style={legalSectionStyle}>
                <h2 style={headlineStyle}>4. Intellectual Property</h2>
                <p style={bodyStyle}>
                  You retain all rights, title, and interest in and to your Content (the data, audio, and scripts you upload or generate). GAP VoicePilot retains all rights, title, and interest in and to the Service, including the AI models and software used to provide the Service.
                </p>
              </div>

              <div id="liability" style={legalSectionStyle}>
                <h2 style={headlineStyle}>5. Limitation of Liability</h2>
                <p style={bodyStyle}>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, GAP VOICEPILOT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
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

const highlightItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
}
