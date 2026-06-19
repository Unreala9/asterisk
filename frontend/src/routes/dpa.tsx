import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { FileText, Shield, Scale } from 'lucide-react'

export const Route = createFileRoute('/dpa')({
  component: DPAPage,
})

function DPAPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 64px", textAlign: "left" }}>
          <p style={eyebrowStyle}>DATA PROCESSING</p>
          <h1 style={displayXlStyle}>Data Processing <br />Agreement</h1>
          <p style={subheadStyle}>How we handle data on behalf of our customers. Rigorous, compliant, and transparent.</p>
          <p style={captionStyle}>LAST UPDATED: MAY 07, 2026</p>
        </section>

        {/* SUMMARY - LILAC */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#c5b0f4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Shield size={20} />
              <h3 style={headlineStyle}>Summary of Commitments</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>GDPR Compliance</h4>
                <p style={bodySmStyle}>We act as a Data Processor under GDPR and maintain Standard Contractual Clauses (SCCs).</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Sub-processors</h4>
                <p style={bodySmStyle}>We only use vetted sub-processors with equivalent data protection standards.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Assistance</h4>
                <p style={bodySmStyle}>We assist you in fulfilling data subject requests and maintaining compliance audits.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILED CONTENT */}
        <section style={{ maxWidth: 1280, margin: "0 auto 96px", padding: "0 24px" }}>
           <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 80 }}>
              <aside style={{ position: "sticky", top: 120, height: "fit-content", display: "flex", flexDirection: "column", gap: 16 }}>
                 <p style={captionStyle}>DPA SECTIONS</p>
                 <a href="#definitions" style={navLinkStyle}>1. Definitions</a>
                 <a href="#processing" style={navLinkStyle}>2. Processing</a>
                 <a href="#security" style={navLinkStyle}>3. Security Measures</a>
                 <a href="#subprocessors" style={navLinkStyle}>4. Sub-processors</a>
                 <a href="#audit" style={navLinkStyle}>5. Audit Rights</a>
              </aside>

              <div style={{ maxWidth: 720 }}>
                 <div id="definitions" style={legalSectionStyle}>
                    <h2 style={headlineStyle}>1. Definitions</h2>
                    <p style={bodyStyle}>The terms "Data Controller", "Data Processor", "Data Subject", "Personal Data", and "Processing" shall have the meanings given to them in Data Protection Laws.</p>
                 </div>
                 <div id="processing" style={legalSectionStyle}>
                    <h2 style={headlineStyle}>2. Processing of Personal Data</h2>
                    <p style={bodyStyle}>VoicePilot shall process Personal Data only on documented instructions from the Controller, including with regard to transfers of personal data to a third country or an international organization.</p>
                 </div>
                 <div id="security" style={legalSectionStyle}>
                    <h2 style={headlineStyle}>3. Security of Processing</h2>
                    <p style={bodyStyle}>Taking into account the state of the art, the costs of implementation and the nature, scope, context and purposes of processing, VoicePilot shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.</p>
                 </div>
                 <div id="subprocessors" style={legalSectionStyle}>
                    <h2 style={headlineStyle}>4. Sub-processing</h2>
                    <p style={bodyStyle}>The Controller provides a general authorization for VoicePilot to engage sub-processors. VoicePilot shall inform the Controller of any intended changes concerning the addition or replacement of sub-processors.</p>
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
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#666",
  textDecoration: "none",
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
