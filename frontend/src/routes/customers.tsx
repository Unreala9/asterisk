import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Quote, ArrowRight, ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
})

function CustomersPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 96px", textAlign: "left" }}>
          <p style={eyebrowStyle}>SUCCESS STORIES</p>
          <h1 style={displayXlStyle}>Voices of <br />Growth</h1>
          <p style={subheadStyle}>How the world's most ambitious teams use GAP VoicePilot to scale their human connection.</p>
        </section>

        {/* FEATURED CASE STUDY - NAVY */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#1f1d3d", color: "#ffffff" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <p style={{ ...eyebrowStyle, color: "rgba(255,255,255,0.4)" }}>RETAIL GIANT</p>
                <h2 style={{ ...displayLgStyle, color: "#ffffff", fontSize: 56 }}>How "Lumina" reduced support costs by 64%.</h2>
                <p style={{ ...bodyStyle, color: "rgba(255,255,255,0.8)", marginTop: 32 }}>
                  By deploying autonomous voice agents for order tracking and returns, Lumina scaled their support capacity to 10k calls/hour without hiring a single new agent.
                </p>
                <button style={{ ...pillButtonStyle, background: "#ffffff", color: "#000000", marginTop: 48 }}>
                  Read the story <ArrowRight size={18} />
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 24, height: 400, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                   <span style={captionStyle}>[ CASE STUDY ILLUSTRATION ]</span>
                </div>
                <div style={quoteCardStyle}>
                  <Quote size={24} color="#c5b0f4" style={{ marginBottom: 16 }} />
                  <p style={{ fontSize: 18, fontWeight: 340, lineHeight: 1.4, color: "#ffffff" }}>
                    "VoicePilot didn't just automate our calls; it made our customer experience feel more human."
                  </p>
                  <p style={{ ...captionStyle, color: "rgba(255,255,255,0.5)", marginTop: 16 }}>SARAH CHEN, CXO @ LUMINA</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GRID OF LOGOS - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "96px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={eyebrowStyle}>TRUSTED BY THE BEST</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 64, marginTop: 64, opacity: 0.6 }}>
             {['VELOCITY', 'ORBIT', 'PULSE', 'NEXUS', 'ZENITH', 'CORE'].map(logo => (
               <div key={logo} style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.2em" }}>{logo}</div>
             ))}
          </div>
        </section>

        {/* SECONDARY CASE STUDY - CORAL */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#f3c9b6" }}>
             <div style={{ maxWidth: 800 }}>
                <p style={eyebrowStyle}>FINTECH INNOVATION</p>
                <h2 style={displayLgStyle}>Securing 50k calls a day with Apex Bank.</h2>
                <p style={bodyStyle}>
                  Apex Bank uses VoicePilot's encrypted streams to handle sensitive identity verification calls, reducing fraud by 42% through real-time voice biometrics.
                </p>
                <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
                  <button style={pillButtonStyle}>View Case Study</button>
                  <button style={{ ...pillButtonStyle, background: "transparent", border: "1px solid #000", color: "#000" }}>Visit Website <ExternalLink size={16} /></button>
                </div>
             </div>
          </div>
        </section>

        {/* TESTIMONIALS - MINT */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#c8e6cd" }}>
            <h2 style={{ ...displayLgStyle, textAlign: "center", marginBottom: 64 }}>The consensus is clear.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
               {[1, 2, 3].map(i => (
                 <div key={i} style={{ background: "rgba(255,255,255,0.4)", padding: 40, borderRadius: 24, border: "1px solid rgba(0,0,0,0.05)" }}>
                    <p style={{ ...bodyStyle, marginBottom: 24 }}>"The latency is what sold us. Our customers don't even realize they're talking to an AI half the time."</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                       <div style={{ width: 40, height: 40, borderRadius: 9999, background: "#000" }} />
                       <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>Alex Rivera</p>
                          <p style={captionStyle}>CTO, FlowState</p>
                       </div>
                    </div>
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

const bodyStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 320,
  lineHeight: 1.45,
  letterSpacing: "-0.26px",
  color: "rgba(0,0,0,0.85)",
}

const captionStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "0.6px",
  color: "rgba(0,0,0,0.4)",
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

const quoteCardStyle: React.CSSProperties = {
  position: "absolute",
  bottom: -40,
  right: -40,
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(20px)",
  padding: 32,
  borderRadius: 24,
  maxWidth: 320,
  border: "1px solid rgba(255,255,255,0.15)",
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
