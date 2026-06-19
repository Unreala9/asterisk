import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { ShieldCheck, Lock, Eye, Terminal, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/security')({
  component: SecurityPage,
})

function SecurityPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO - NAVY */}
        <section style={{ background: "#1f1d3d", padding: "160px 24px 120px", color: "#ffffff" }}>
           <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <p style={{ ...eyebrowStyle, color: "rgba(255,255,255,0.4)" }}>ENTERPRISE TRUST</p>
              <h1 style={{ ...displayXlStyle, color: "#ffffff" }}>Security by <br />Architecture</h1>
              <p style={{ ...subheadStyle, color: "rgba(255,255,255,0.8)" }}>We treat your data with the same level of care and obsession we put into our AI models.</p>
           </div>
        </section>

        {/* COMPLIANCE - MINT */}
        <section style={{ ...sectionGapStyle, marginTop: -64 }}>
           <div style={{ ...blockBaseStyle, background: "#c8e6cd" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
                 {['SOC2 TYPE II', 'HIPAA COMPLIANT', 'GDPR READY', 'ISO 27001'].map(cert => (
                   <div key={cert} style={certCardStyle}>
                      <ShieldCheck size={20} color="#1ea64a" />
                      <p style={{ fontWeight: 600, letterSpacing: "0.05em" }}>{cert}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* PILLARS - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "96px auto", padding: "0 24px" }}>
           <h2 style={{ ...displayLgStyle, marginBottom: 80 }}>Our Security Pillars</h2>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 64 }}>
              <div>
                 <Lock size={32} style={{ marginBottom: 24 }} />
                 <h3 style={headlineStyle}>Encryption at Rest & Transit</h3>
                 <p style={bodyStyle}>All voice data is encrypted using TLS 1.3 in transit and AES-256 at rest. Our keys are managed in FIPS 140-2 Level 3 hardware security modules.</p>
              </div>
              <div>
                 <Eye size={32} style={{ marginBottom: 24 }} />
                 <h3 style={headlineStyle}>Continuous Monitoring</h3>
                 <p style={bodyStyle}>Our security operations center (SOC) monitors for threats 24/7. We perform automated vulnerability scans daily and manual pentests quarterly.</p>
              </div>
              <div>
                 <Terminal size={32} style={{ marginBottom: 24 }} />
                 <h3 style={headlineStyle}>Secure Development</h3>
                 <p style={bodyStyle}>Security is part of our CI/CD pipeline. Every line of code undergoes static and dynamic analysis before reaching production.</p>
              </div>
           </div>
        </section>

        {/* DATA PRIVACY - PINK */}
        <section style={sectionGapStyle}>
           <div style={{ ...blockBaseStyle, background: "#efd4d4" }}>
              <p style={eyebrowStyle}>DATA PRIVACY</p>
              <h2 style={displayLgStyle}>Zero-Retention by Default</h2>
              <p style={{ ...bodyStyle, marginTop: 24, maxWidth: 800 }}>
                We believe you shouldn't have to trust us with your data. That's why our infrastructure is designed for zero-retention. Audio fragments are processed in volatile memory and purged immediately after synthesis.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginTop: 48 }}>
                 {['No persistent storage of audio', 'End-to-end stream isolation', 'Self-hosted deployment options', 'Data residency controls'].map(p => (
                   <div key={p} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <CheckCircle size={18} color="#8b3535" />
                      <p style={{ ...bodySmStyle, color: "#8b3535", fontWeight: 500 }}>{p}</p>
                   </div>
                 ))}
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

const displayLgStyle: React.CSSProperties = {
  fontSize: 64,
  fontWeight: 340,
  lineHeight: 1.1,
  letterSpacing: "-0.96px",
  color: "#000000",
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
  marginBottom: 16,
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

const sectionGapStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto 96px",
  padding: "0 24px",
}

const blockBaseStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 80,
}

const certCardStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: 32,
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  textAlign: "center",
}
