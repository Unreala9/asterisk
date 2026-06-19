import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Github, Package, Download } from 'lucide-react'

export const Route = createFileRoute('/sdks')({
  component: SDKsPage,
})

function SDKsPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 80px", textAlign: "left" }}>
          <p style={eyebrowStyle}>CLIENT LIBRARIES</p>
          <h1 style={displayXlStyle}>Build in your <br />native tongue.</h1>
          <p style={subheadStyle}>Our SDKs handle the heavy lifting of audio streaming and WebSocket management, so you can focus on building.</p>
        </section>

        {/* SDK GRID */}
        <section style={sectionGapStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 32 }}>
             {/* Node.js - LILAC */}
             <div style={{ ...blockBaseStyle, background: "#c5b0f4", padding: 64 }}>
                <div style={iconBoxStyle}>JS</div>
                <h2 style={headlineStyle}>Node.js</h2>
                <p style={bodyStyle}>Full support for TypeScript, async streaming, and Express/Fastify integrations.</p>
                <div style={sdkActionStyle}>
                   <code style={codeInlineStyle}>npm install @voicepilot/sdk</code>
                   <Github size={20} />
                </div>
             </div>

             {/* Python - MINT */}
             <div style={{ ...blockBaseStyle, background: "#c8e6cd", padding: 64 }}>
                <div style={iconBoxStyle}>PY</div>
                <h2 style={headlineStyle}>Python</h2>
                <p style={bodyStyle}>Designed for AI researchers. Native support for FastAPI and asynchronous event loops.</p>
                <div style={sdkActionStyle}>
                   <code style={codeInlineStyle}>pip install voicepilot-sdk</code>
                   <Github size={20} />
                </div>
             </div>

             {/* Go - LIME */}
             <div style={{ ...blockBaseStyle, background: "#dceeb1", padding: 64 }}>
                <div style={iconBoxStyle}>GO</div>
                <h2 style={headlineStyle}>Go</h2>
                <p style={bodyStyle}>High-performance, low-level access to audio buffers and real-time stream control.</p>
                <div style={sdkActionStyle}>
                   <code style={codeInlineStyle}>go get github.com/vp/sdk</code>
                   <Github size={20} />
                </div>
             </div>

             {/* Ruby - PINK */}
             <div style={{ ...blockBaseStyle, background: "#efd4d4", padding: 64 }}>
                <div style={iconBoxStyle}>RB</div>
                <h2 style={headlineStyle}>Ruby</h2>
                <p style={bodyStyle}>Elegant wrapper for Rails and Sinatra. Perfect for rapid prototyping of voice flows.</p>
                <div style={sdkActionStyle}>
                   <code style={codeInlineStyle}>gem install voicepilot</code>
                   <Github size={20} />
                </div>
             </div>
          </div>
        </section>

        {/* COMMUNITY - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "96px auto", padding: "0 24px", textAlign: "center" }}>
           <p style={eyebrowStyle}>ECOSYSTEM</p>
           <h2 style={displayLgStyle}>Can't find your language?</h2>
           <p style={{ ...subheadStyle, margin: "24px auto 48px" }}>Our REST API is open for any language. Check our community-led SDKs or build your own.</p>
           <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button style={pillButtonStyle}>Community SDKs</button>
              <button style={{ ...pillButtonStyle, background: "transparent", border: "1px solid #000", color: "#000" }}>Contribution Guide</button>
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
  fontSize: 32,
  fontWeight: 540,
  lineHeight: 1.2,
  color: "#000000",
  marginBottom: 16,
}

const bodyStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 320,
  lineHeight: 1.45,
  letterSpacing: "-0.26px",
  color: "rgba(0,0,0,0.85)",
  marginBottom: 32,
}

const sectionGapStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto 96px",
  padding: "0 24px",
}

const blockBaseStyle: React.CSSProperties = {
  borderRadius: 24,
}

const iconBoxStyle: React.CSSProperties = {
  background: "#ffffff",
  width: 56,
  height: 56,
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 18,
  marginBottom: 32,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
}

const sdkActionStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.4)",
  padding: "16px 24px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.05)",
}

const codeInlineStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 14,
  fontWeight: 500,
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
