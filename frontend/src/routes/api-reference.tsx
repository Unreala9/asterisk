import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Code, Terminal, Zap, Book, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/api-reference')({
  component: APIReferencePage,
})

function APIReferencePage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO - DARK */}
        <section style={{ background: "#111", padding: "160px 24px 120px", color: "#ffffff" }}>
           <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <p style={{ ...eyebrowStyle, color: "rgba(255,255,255,0.4)" }}>DOCUMENTATION</p>
              <h1 style={{ ...displayXlStyle, color: "#ffffff" }}>API Reference</h1>
              <p style={{ ...subheadStyle, color: "rgba(255,255,255,0.8)" }}>Build powerful voice-first applications with our robust, low-latency REST and WebSocket APIs.</p>
           </div>
        </section>

        {/* QUICK START - MINT */}
        <section style={{ ...sectionGapStyle, marginTop: -64 }}>
           <div style={{ ...blockBaseStyle, background: "#c8e6cd" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                 <div>
                    <h2 style={displayLgSmallStyle}>Get started in <br />under 5 minutes.</h2>
                    <p style={bodyStyle}>Authenticate your requests with your API key and start streaming voice data instantly.</p>
                    <button style={{ ...pillButtonStyle, marginTop: 32 }}>Read Quickstart</button>
                 </div>
                 <div style={codeBlockStyle}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                       <div style={{ width: 12, height: 12, borderRadius: 99, background: "#ff5f56" }} />
                       <div style={{ width: 12, height: 12, borderRadius: 99, background: "#ffbd2e" }} />
                       <div style={{ width: 12, height: 12, borderRadius: 99, background: "#27c93f" }} />
                    </div>
                    <pre style={{ margin: 0, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: "#d1d1d1" }}>
{`curl -X POST https://api.voicepilot.ai/v1/agents \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{
    "voice": "alloy-premium",
    "prompt": "You are a helpful assistant."
  }'`}
                    </pre>
                 </div>
              </div>
           </div>
        </section>

        {/* CORE ENDPOINTS - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "96px auto", padding: "0 24px" }}>
           <h2 style={{ ...displayLgStyle, marginBottom: 64 }}>Core Endpoints</h2>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
              {[
                { title: "Agents", desc: "Create and manage your AI agent personalities and system prompts.", icon: <Zap size={20} /> },
                { title: "Streams", desc: "Initiate WebSocket connections for real-time, low-latency audio processing.", icon: <Terminal size={20} /> },
                { title: "Transcripts", desc: "Retrieve and search historical call transcripts and metadata.", icon: <Book size={20} /> },
                { title: "Voices", desc: "List and preview available high-fidelity synthetic voices.", icon: <Code size={20} /> },
              ].map(item => (
                <div key={item.title} style={endpointCardStyle}>
                   <div style={{ background: "#f7f7f5", padding: 12, borderRadius: 12, width: "fit-content", marginBottom: 24 }}>{item.icon}</div>
                   <h3 style={headlineStyle}>{item.title}</h3>
                   <p style={bodySmStyle}>{item.desc}</p>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, fontWeight: 500, fontSize: 14 }}>
                      Explore <ChevronRight size={14} />
                   </div>
                </div>
              ))}
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

const displayLgSmallStyle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 340,
  lineHeight: 1.1,
  letterSpacing: "-0.015em",
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
  fontSize: 24,
  fontWeight: 540,
  lineHeight: 1.35,
  color: "#000000",
  marginBottom: 8,
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

const codeBlockStyle: React.CSSProperties = {
  background: "#1e1e1e",
  padding: 32,
  borderRadius: 16,
  boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
}

const endpointCardStyle: React.CSSProperties = {
  padding: 40,
  borderRadius: 24,
  border: "1px solid #f1f1f1",
  transition: "all 0.2s ease",
}

const pillButtonStyle: React.CSSProperties = {
  background: "#000000",
  color: "#ffffff",
  border: "none",
  borderRadius: 9999,
  padding: "16px 32px",
  fontSize: 18,
  fontWeight: 500,
  cursor: "pointer",
}
