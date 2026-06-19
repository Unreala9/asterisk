import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Heart, Zap, Globe, ArrowUpRight } from 'lucide-react'

export const Route = createFileRoute('/careers')({
  component: CareersPage,
})

function CareersPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px 96px", textAlign: "left" }}>
          <p style={eyebrowStyle}>JOIN THE MISSION</p>
          <h1 style={displayXlStyle}>Build the <br />voice of the future.</h1>
          <p style={subheadStyle}>We're a team of researchers, designers, and engineers obsessed with the intersection of sound and intelligence.</p>
        </section>

        {/* CULTURE - PINK */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#efd4d4" }}>
            <p style={eyebrowStyle}>OUR VALUES</p>
            <h2 style={displayLgStyle}>A culture of craft.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 64, marginTop: 48 }}>
              <div>
                <Heart size={24} style={{ marginBottom: 16 }} />
                <h3 style={headlineStyle}>Empathy by Design</h3>
                <p style={bodyStyle}>We build tools that respect the user. If it's not helpful and human, we don't ship it.</p>
              </div>
              <div>
                <Zap size={24} style={{ marginBottom: 16 }} />
                <h3 style={headlineStyle}>High Velocity</h3>
                <p style={bodyStyle}>We move fast because the future won't wait. We ship daily and learn in real-time.</p>
              </div>
              <div>
                <Globe size={24} style={{ marginBottom: 16 }} />
                <h3 style={headlineStyle}>Global Mindset</h3>
                <p style={bodyStyle}>Our team is remote-first and spread across 12 time zones. Diversity is our engine.</p>
              </div>
            </div>
          </div>
        </section>

        {/* OPEN ROLES - WHITE CANVAS */}
        <section style={{ maxWidth: 1280, margin: "96px auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64, borderBottom: "1px solid #e6e6e6", paddingBottom: 24 }}>
             <h2 style={displayLgStyle}>Open Roles</h2>
             <p style={captionStyle}>8 POSITIONS AVAILABLE</p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { title: "Senior AI Researcher", team: "Engineering", location: "Remote / SF" },
              { title: "Voice Interaction Designer", team: "Design", location: "Remote / London" },
              { title: "Backend Engineer (Go/Rust)", team: "Infrastructure", location: "Remote" },
              { title: "Head of Customer Success", team: "Operations", location: "Remote / NY" },
              { title: "Developer Advocate", team: "Growth", location: "Remote" },
            ].map((job, i) => (
              <div key={i} style={jobRowStyle}>
                <div>
                   <h4 style={{ fontSize: 24, fontWeight: 540, letterSpacing: "-0.01em" }}>{job.title}</h4>
                   <p style={bodySmStyle}>{job.team} · {job.location}</p>
                </div>
                <button style={applyButtonStyle}>Apply <ArrowUpRight size={18} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* PERKS - LILAC */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#c5b0f4" }}>
             <p style={eyebrowStyle}>PERKS & BENEFITS</p>
             <h2 style={displayLgStyle}>Designed for life.</h2>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, marginTop: 48 }}>
                <div style={perkCardStyle}>
                   <h4 style={headlineSmallStyle}>Full health coverage</h4>
                   <p style={bodySmStyle}>Premium medical, dental, and vision for you and your family.</p>
                </div>
                <div style={perkCardStyle}>
                   <h4 style={headlineSmallStyle}>Remote-first stipend</h4>
                   <p style={bodySmStyle}>$2,500 to set up your dream home office, plus $500/year for upgrades.</p>
                </div>
                <div style={perkCardStyle}>
                   <h4 style={headlineSmallStyle}>Unlimited learning</h4>
                   <p style={bodySmStyle}>We pay for your books, courses, and conferences. No questions asked.</p>
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

const headlineSmallStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.3,
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

const jobRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "40px 0",
  borderBottom: "1px solid #f1f1f1",
}

const applyButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#000000",
  fontSize: 18,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
}

const perkCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.4)",
  padding: 32,
  borderRadius: 20,
  border: "1px solid rgba(0,0,0,0.05)",
}
