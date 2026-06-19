import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", overflowX: "hidden" }}>
      <Navbar />
      
      <main>
        {/* HERO */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(80px, 12vw, 120px) 24px clamp(40px, 8vw, 80px)", textAlign: "left" }}>
          <p style={eyebrowStyle}>CONTACT US</p>
          <h1 style={displayXlStyle}>Let's talk <br />about your vision.</h1>
          <p style={subheadStyle}>Our team is here to help you scale your voice infrastructure, whether you're a startup or a global enterprise.</p>
        </section>

        {/* CONTACT FORM - LIME */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#dceeb1" }}>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(40px, 8vw, 80px)" }}>
                <div>
                   <h2 style={displayLgStyle}>Get in touch.</h2>
                   <p style={{ ...bodyStyle, marginTop: 24, marginBottom: 48 }}>
                     Fill out the form and our sales team will reach out within 24 hours.
                   </p>
                   <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                      <div style={contactInfoStyle}>
                         <Mail size={20} />
                         <p style={bodyStyle}>sales@voicepilot.ai</p>
                      </div>
                      <div style={contactInfoStyle}>
                         <Phone size={20} />
                         <p style={bodyStyle}>+1 (555) 012-3456</p>
                      </div>
                      <div style={contactInfoStyle}>
                         <MessageCircle size={20} />
                         <p style={bodyStyle}>Live Chat (Available 24/7)</p>
                      </div>
                   </div>
                </div>
                
                <div style={formContainerStyle}>
                   <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
                      <div style={inputGroupStyle}>
                         <label style={labelStyle}>FIRST NAME</label>
                         <input type="text" placeholder="Jane" style={inputStyle} />
                      </div>
                      <div style={inputGroupStyle}>
                         <label style={labelStyle}>LAST NAME</label>
                         <input type="text" placeholder="Doe" style={inputStyle} />
                      </div>
                   </div>
                   <div style={inputGroupStyle}>
                      <label style={labelStyle}>WORK EMAIL</label>
                      <input type="email" placeholder="jane@company.com" style={inputStyle} />
                   </div>
                   <div style={inputGroupStyle}>
                      <label style={labelStyle}>COMPANY SIZE</label>
                      <select style={inputStyle}>
                         <option>1-50 employees</option>
                         <option>51-200 employees</option>
                         <option>201-1000 employees</option>
                         <option>1000+ employees</option>
                      </select>
                   </div>
                   <div style={inputGroupStyle}>
                      <label style={labelStyle}>HOW CAN WE HELP?</label>
                      <textarea placeholder="Tell us about your project..." style={{ ...inputStyle, height: 120, resize: "none" }} />
                   </div>
                   <button style={pillButtonStyle}>Submit Request</button>
                </div>
             </div>
          </div>
        </section>

        {/* OFFICES - CREAM */}
        <section style={sectionGapStyle}>
          <div style={{ ...blockBaseStyle, background: "#f4ecd6" }}>
             <p style={eyebrowStyle}>GLOBAL PRESENCE</p>
             <h2 style={displayLgStyle}>Our Offices</h2>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48, marginTop: 48 }}>
                <div style={officeCardStyle}>
                   <MapPin size={24} style={{ marginBottom: 16 }} />
                   <h4 style={headlineStyle}>San Francisco</h4>
                   <p style={bodySmStyle}>123 Mission Street, Suite 456<br />San Francisco, CA 94105</p>
                </div>
                <div style={officeCardStyle}>
                   <MapPin size={24} style={{ marginBottom: 16 }} />
                   <h4 style={headlineStyle}>London</h4>
                   <p style={bodySmStyle}>78 Kingsway, Holborn<br />London, WC2B 6AH</p>
                </div>
                <div style={officeCardStyle}>
                   <MapPin size={24} style={{ marginBottom: 16 }} />
                   <h4 style={headlineStyle}>Remote-First</h4>
                   <p style={bodySmStyle}>Distributed teams in over 15 countries worldwide.</p>
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
  fontSize: "clamp(42px, 6vw, 86px)",
  fontWeight: 340,
  lineHeight: 1.0,
  letterSpacing: "-1.72px",
  color: "#000000",
  marginBottom: 32,
}

const displayLgStyle: React.CSSProperties = {
  fontSize: "clamp(36px, 6vw, 64px)",
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

const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: "rgba(0,0,0,0.5)",
  marginBottom: 8,
}

const sectionGapStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto 96px",
  padding: "0 24px",
}

const blockBaseStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: "clamp(40px, 8vw, 80px) clamp(24px, 5vw, 80px)",
}

const contactInfoStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
}

const formContainerStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 48,
  boxShadow: "0 4px 32px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: 24,
}

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 8,
  border: "1px solid #e6e6e6",
  fontSize: 16,
  fontFamily: "inherit",
  background: "#f7f7f5",
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
  width: "fit-content",
}

const officeCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.4)",
  padding: 32,
  borderRadius: 20,
  border: "1px solid rgba(0,0,0,0.05)",
}
