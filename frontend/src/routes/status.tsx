import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { CheckCircle2, AlertTriangle, Clock, Server } from 'lucide-react'

export const Route = createFileRoute('/status')({
  component: StatusPage,
})

function StatusPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 80px", textAlign: "left" }}>
          <p style={eyebrowStyle}>SYSTEM STATUS</p>
          <h1 style={displayXlStyle}>All systems <br />operational.</h1>
          <div style={overallStatusPillStyle}>
             <CheckCircle2 size={20} color="#1ea64a" />
             <span style={{ fontWeight: 600 }}>Operational</span>
          </div>
        </section>

        {/* SERVICES - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "0 auto 96px", padding: "0 24px" }}>
           <div style={{ borderTop: "1px solid #e6e6e6", paddingTop: 48 }}>
              <div style={serviceRowStyle}>
                 <div>
                    <h3 style={headlineStyle}>Real-time Synthesis</h3>
                    <p style={bodySmStyle}>Global voice generation engine.</p>
                 </div>
                 <div style={statusLabelStyle}>OPERATIONAL</div>
              </div>
              <div style={serviceRowStyle}>
                 <div>
                    <h3 style={headlineStyle}>Inbound Streams</h3>
                    <p style={bodySmStyle}>Voice input processing and VAD.</p>
                 </div>
                 <div style={statusLabelStyle}>OPERATIONAL</div>
              </div>
              <div style={serviceRowStyle}>
                 <div>
                    <h3 style={headlineStyle}>Dashboard & API</h3>
                    <p style={bodySmStyle}>User management and configuration.</p>
                 </div>
                 <div style={statusLabelStyle}>OPERATIONAL</div>
              </div>
              <div style={serviceRowStyle}>
                 <div>
                    <h3 style={headlineStyle}>Knowledge Base Indexing</h3>
                    <p style={bodySmStyle}>Vector search and document processing.</p>
                 </div>
                 <div style={{ ...statusLabelStyle, color: "#8b3535", background: "#efd4d4" }}>DEGRADED</div>
              </div>
           </div>
        </section>

        {/* UPTIME HISTORY - CREAM */}
        <section style={sectionGapStyle}>
           <div style={{ ...blockBaseStyle, background: "#f4ecd6" }}>
              <p style={eyebrowStyle}>UPTIME HISTORY</p>
              <h2 style={displayLgStyle}>Last 90 Days</h2>
              <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
                 {[1, 2, 3].map(i => (
                   <div key={i} style={uptimeRowStyle}>
                      <p style={{ fontWeight: 600, width: 100 }}>May 0{i}</p>
                      <div style={barContainerStyle}>
                         {Array.from({ length: 30 }).map((_, j) => (
                           <div key={j} style={{ ...barStyle, background: j === 25 ? "#f3c9b6" : "#1ea64a" }} />
                         ))}
                      </div>
                      <p style={{ fontWeight: 600, width: 80, textAlign: "right" }}>99.9%</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* INCIDENT LOG - LIME */}
        <section style={sectionGapStyle}>
           <div style={{ ...blockBaseStyle, background: "#dceeb1" }}>
              <p style={eyebrowStyle}>INCIDENT LOG</p>
              <h2 style={displayLgStyle}>Recent Incidents</h2>
              <div style={{ marginTop: 48 }}>
                 <div style={{ paddingBottom: 32, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                       <AlertTriangle size={18} color="#856404" />
                       <span style={captionStyle}>RESOLVED · APR 28, 2026</span>
                    </div>
                    <h3 style={headlineStyle}>Latency increase in us-east-1</h3>
                    <p style={bodyStyle}>We experienced a brief spike in synthesis latency due to a downstream provider issue. Systems were rerouted within 12 minutes.</p>
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

const headlineStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 540,
  lineHeight: 1.35,
  color: "#000000",
  marginBottom: 4,
}

const bodyStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 320,
  lineHeight: 1.45,
  color: "rgba(0,0,0,0.85)",
}

const bodySmStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 330,
  lineHeight: 1.45,
  color: "rgba(0,0,0,0.5)",
}

const captionStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: "rgba(0,0,0,0.5)",
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

const overallStatusPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 12,
  background: "#f0fdf4",
  border: "1px solid #dcfce7",
  padding: "12px 24px",
  borderRadius: 9999,
  fontSize: 18,
  color: "#1ea64a",
}

const serviceRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 0",
  borderBottom: "1px solid #f1f1f1",
}

const statusLabelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 700,
  color: "#1ea64a",
  background: "#f0fdf4",
  padding: "4px 10px",
  borderRadius: 4,
}

const uptimeRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  padding: "12px 0",
}

const barContainerStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  gap: 2,
  height: 24,
}

const barStyle: React.CSSProperties = {
  flex: 1,
  borderRadius: 2,
}
