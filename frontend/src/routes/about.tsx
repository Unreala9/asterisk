import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { ArrowRight, Users, Globe, Zap, Heart } from 'lucide-react'
import { useRef, useEffect } from 'react'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

const ABOUT_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4";

function AboutPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85;
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO SECTION — Retell-style Luminous Card */}
        <section style={{ padding: "5px", marginTop: "4%", background: "#ffffff" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(600px, 90vh, 860px)",
              borderRadius: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              background: "#050a18",
            }}
          >
            {/* Clear Background Video */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.85 }}>
              <video
                ref={videoRef}
                src={ABOUT_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Subtle scrim for text readability */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,10,24,0.4) 0%, rgba(5,10,24,0.2) 50%, rgba(5,10,24,0.6) 100%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 2, maxWidth: 1000, padding: "0 24px" }}>
              <p style={{ ...eyebrowStyle, color: "rgba(255,255,255,0.7)", marginBottom: 32, letterSpacing: "0.12em" }}>OUR MISSION</p>
              <h1 style={{ 
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(72px, 8vw, 112px)",
                fontWeight: 300,
                lineHeight: 0.88,
                letterSpacing: "-0.045em",
                color: "#ffffff",
                marginBottom: 32,
              }}>
                Human intelligence,<br />at machine scale.
              </h1>
              <p style={{ fontSize: 26, fontWeight: 330, lineHeight: 1.4, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.85)", maxWidth: 700, margin: "0 auto" }}>
                We're building the infrastructure for the next generation of voice-first communication. Scalable, intelligent, and human-like.
              </p>
            </div>

            {/* Scroll hint */}
            <div
              style={{
                position: "absolute",
                bottom: 32,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Scroll</span>
              <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.25)", animation: "scrollPulse 2s ease-in-out infinite" }} />
            </div>
          </div>
        </section>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
          
          @keyframes scrollPulse {
            0%, 100% { opacity: 0.3; transform: scaleY(1); }
            50%       { opacity: 0.8; transform: scaleY(1.2); }
          }
        `}</style>

        {/* VISION SECTION - LILAC Color Block */}
        <section style={{ maxWidth: 1280, margin: "clamp(48px, 10vw, 96px) auto", padding: "0 24px" }}>
          <div style={{ background: "#c5b0f4", borderRadius: 24, padding: "clamp(40px, 8vw, 96px) clamp(24px, 5vw, 64px)", minHeight: 600, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ ...eyebrowStyle, color: "#3d2080", marginBottom: 48 }}>THE VISION</p>
            <h2 style={{ ...displayLgStyle, maxWidth: 900, marginBottom: 64 }}>
              Communication is the heartbeat of business. We make it scalable, intelligent, and available 24/7.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48 }}>
              <div style={cardStyle}>
                <h3 style={headlineStyle}>Natural Conversations</h3>
                <p style={bodyStyle}>Our agents don't just follow scripts; they understand context, intent, and emotion to provide human-like interactions that feel authentic and helpful.</p>
              </div>
              <div style={cardStyle}>
                <h3 style={headlineStyle}>Instant Scaling</h3>
                <p style={bodyStyle}>From 1 call to 1,000 in seconds. No hiring, no training, no infrastructure overhead. Just performance that matches your ambition.</p>
              </div>
            </div>
          </div>
        </section>

        {/* VALUES SECTION - White Canvas */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px, 10vw, 96px) 24px" }}>
          <p style={eyebrowStyle}>OUR VALUES</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, marginTop: 64 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Zap size={32} />
              <h3 style={cardTitleStyle}>Speed to Impact</h3>
              <p style={bodyStyle}>We value solutions that deliver immediate value to our customers without sacrificing long-term stability or technical excellence.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Globe size={32} />
              <h3 style={cardTitleStyle}>Accessibility First</h3>
              <p style={bodyStyle}>Making advanced AI technology accessible to teams of all sizes, from solo founders to global enterprises.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Heart size={32} />
              <h3 style={cardTitleStyle}>Human Centered</h3>
              <p style={bodyStyle}>AI is a tool to empower humans, not replace them. We build for the people who talk and the people who listen.</p>
            </div>
          </div>
        </section>

        {/* TEAM SECTION - PINK Color Block */}
        <section style={{ maxWidth: 1280, margin: "clamp(48px, 10vw, 96px) auto", padding: "0 24px" }}>
          <div style={{ background: "#efd4d4", borderRadius: 24, padding: "clamp(40px, 8vw, 96px) clamp(24px, 5vw, 64px)", textAlign: "center" }}>
            <p style={{ ...eyebrowStyle, color: "#8b3535", marginBottom: 32 }}>THE TEAM</p>
            <h2 style={{ ...displayLgStyle, margin: "0 auto 48px" }}>
              Made by people who
              <br />love to build.
            </h2>
            <p style={{ ...bodyLgStyle, maxWidth: 700, margin: "0 auto 64px" }}>
              GAP VoicePilot is built by a distributed team of engineers, designers, and linguists dedicated to perfecting the art of conversation. We're a technical team that joyful work.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <button style={primaryBtnStyle}>Join the team</button>
              <button style={secondaryBtnStyle}>Our Story</button>
            </div>
          </div>
        </section>

        <section style={{ background: "#000000", color: "#ffffff", padding: "clamp(80px, 12vw, 120px) 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(48px, 6vw, 86px)", fontWeight: 340, letterSpacing: "-0.03em", lineHeight: 1.0, marginBottom: 48 }}>
            Ready to scale
            <br />your voice?
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <button style={{ ...primaryBtnStyle, background: "#ffffff", color: "#000000", padding: "16px 40px", fontSize: 20 }}>Get Started Free</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/* ── Style Objects based on DESIGN-figma.md ── */

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.3,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#999",
}

const displayXlStyle: React.CSSProperties = {
  fontSize: "clamp(56px, 10vw, 86px)",
  fontWeight: 340,
  lineHeight: 1.0,
  letterSpacing: "-0.03em",
  color: "#000000",
}

const displayLgStyle: React.CSSProperties = {
  fontSize: "clamp(36px, 6vw, 64px)",
  fontWeight: 340,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  color: "#000000",
}

const headlineStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 540,
  lineHeight: 1.35,
  letterSpacing: "-0.01em",
  marginBottom: 16,
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.45,
}

const bodyLgStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 330,
  lineHeight: 1.4,
  color: "#111",
}

const bodyStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 320,
  lineHeight: 1.45,
  color: "#333",
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.4)",
  borderRadius: 24,
  padding: 48,
  border: "1px solid rgba(0, 0, 0, 0.05)",
}

const primaryBtnStyle: React.CSSProperties = {
  background: "#000000",
  color: "#ffffff",
  fontSize: 20,
  fontWeight: 480,
  padding: "12px 32px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.2s",
}

const secondaryBtnStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#000000",
  fontSize: 20,
  fontWeight: 480,
  padding: "12px 32px",
  borderRadius: 9999,
  border: "1px solid #e6e6e6",
  cursor: "pointer",
  transition: "background 0.2s",
}
