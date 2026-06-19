import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { 
  Search, 
  Copy, 
  Terminal, 
  Zap, 
  Lock, 
  Radio, 
  Cpu, 
  Database, 
  Mic2, 
  Code2, 
  AlertCircle, 
  BarChart3, 
  ShieldCheck, 
  CreditCard, 
  Layers, 
  Share2, 
  Bell, 
  Play, 
  BookOpen, 
  HelpCircle, 
  MessageSquare,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import React, { useState } from 'react'

export const Route = createFileRoute('/docs')({
  component: DocumentationPage,
})

function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('introduction')

  const sections = [
    { id: 'introduction', label: '1. Introduction', icon: <BookOpen size={16} /> },
    { id: 'quickstart', label: '2. Quick Start', icon: <Zap size={16} /> },
    { id: 'authentication', label: '3. Authentication', icon: <Lock size={16} /> },
    { id: 'api-reference', label: '4. API Reference', icon: <Terminal size={16} /> },
    { id: 'realtime', label: '5. Real-Time / WebSockets', icon: <Radio size={16} /> },
    { id: 'configuration', label: '6. AI Agent Config', icon: <Cpu size={16} /> },
    { id: 'knowledge-base', label: '7. Knowledge Base / RAG', icon: <Database size={16} /> },
    { id: 'voice-settings', label: '8. Voice Settings', icon: <Mic2 size={16} /> },
    { id: 'local-dev', label: '9. Local Development', icon: <Code2 size={16} /> },
    { id: 'error-handling', label: '10. Error Handling', icon: <AlertCircle size={16} /> },
    { id: 'limits', label: '11. Rate Limits & Scaling', icon: <BarChart3 size={16} /> },
    { id: 'security', label: '12. Security', icon: <ShieldCheck size={16} /> },
    { id: 'billing', label: '13. Billing & Usage', icon: <CreditCard size={16} /> },
    { id: 'sdks', label: '14. SDKs & Libraries', icon: <Layers size={16} /> },
    { id: 'integrations', label: '15. Integrations', icon: <Share2 size={16} /> },
    { id: 'webhooks', label: '16. Webhooks', icon: <Bell size={16} /> },
    { id: 'playground', label: '17. Playground', icon: <Play size={16} /> },
    { id: 'tutorials', label: '18. Tutorials / Guides', icon: <BookOpen size={16} /> },
    { id: 'faq', label: '19. FAQ', icon: <HelpCircle size={16} /> },
    { id: 'support', label: '20. Support', icon: <MessageSquare size={16} /> },
  ]

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#000000", minHeight: "100vh" }}>
      <Navbar />
      
      <div style={{ display: "flex", maxWidth: 1440, margin: "0 auto", padding: "0 24px" }}>
        
        {/* SIDEBAR */}
        <aside style={sidebarStyle}>
           <div style={searchContainerStyle}>
              <Search size={16} color="#999" />
              <input type="text" placeholder="Search docs..." style={searchInputStyle} />
           </div>
           <nav style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 4 }}>
              {sections.map(section => (
                <button 
                  key={section.id} 
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    ...navItemStyle,
                    background: activeSection === section.id ? "#f7f7f5" : "transparent",
                    color: activeSection === section.id ? "#000" : "#666",
                    fontWeight: activeSection === section.id ? 600 : 400,
                  }}
                >
                   {section.icon}
                   {section.label}
                </button>
              ))}
           </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={mainContentStyle}>
           
           {/* 1. INTRODUCTION */}
           <section id="introduction" style={docSectionStyle}>
              <p style={eyebrowStyle}>DOCUMENTATION</p>
              <h1 style={displayXlStyle}>Introduction</h1>
              <p style={subheadStyle}>
                 VoicePilot is a real-time AI voice assistant platform that enables developers to build intelligent, low-latency calling agents.
              </p>
              <p style={bodyStyle}>
                 Whether you're building an automated customer support line, a personal scheduling assistant, or a complex outbound sales agent, VoicePilot provides the infrastructure to synthesize, process, and manage voice interactions at scale.
              </p>
              <div style={{ ...blockBaseStyle, background: "#f4ecd6", marginTop: 48 }}>
                 <h4 style={headlineStyle}>Who is this for?</h4>
                 <ul style={listStyle}>
                    <li><strong>Developers:</strong> Building voice-first applications with REST/WebSockets.</li>
                    <li><strong>Product Teams:</strong> Designing conversational AI personalities.</li>
                    <li><strong>Enterprises:</strong> Scaling human-like voice infrastructure globally.</li>
                 </ul>
              </div>
           </section>

           {/* 2. QUICK START */}
           <section id="quickstart" style={docSectionStyle}>
              <h2 style={displayLgStyle}>Quick Start</h2>
              <p style={bodyStyle}>Get a working voice agent live in under 5 minutes.</p>
              
              <div style={stepContainerStyle}>
                 <div style={stepCircleStyle}>1</div>
                 <div>
                    <h3 style={headlineSmallStyle}>Create an Account</h3>
                    <p style={bodySmStyle}>Sign up at <a href="#" style={{ color: "#000", fontWeight: 600 }}>dashboard.voicepilot.ai</a> to get started.</p>
                 </div>
              </div>

              <div style={stepContainerStyle}>
                 <div style={stepCircleStyle}>2</div>
                 <div>
                    <h3 style={headlineSmallStyle}>Generate API Key</h3>
                    <p style={bodySmStyle}>Navigate to Settings &gt; API Keys and create your first secret key.</p>
                 </div>
              </div>

              <div style={stepContainerStyle}>
                 <div style={stepCircleStyle}>3</div>
                 <div>
                    <h3 style={headlineSmallStyle}>Install the SDK</h3>
                    <div style={codeBlockStyle}>
                       <pre style={{ margin: 0 }}>npm install @voicepilot/sdk</pre>
                       <Copy size={16} style={{ cursor: "pointer", opacity: 0.5 }} />
                    </div>
                 </div>
              </div>

              <div style={stepContainerStyle}>
                 <div style={stepCircleStyle}>4</div>
                 <div>
                    <h3 style={headlineSmallStyle}>Run your first agent</h3>
                    <div style={codeBlockFullStyle}>
<pre style={{ margin: 0, color: "#d1d1d1" }}>
{`import { VoicePilot } from '@voicepilot/sdk';

const agent = new VoicePilot({
  apiKey: process.env.VP_API_KEY
});

agent.start({
  voice: 'alloy-premium',
  prompt: 'You are a helpful travel assistant.'
});`}
</pre>
                    </div>
                 </div>
              </div>
           </section>

           {/* 3. AUTHENTICATION */}
           <section id="authentication" style={docSectionStyle}>
              <h2 style={displayLgStyle}>Authentication</h2>
              <div style={{ ...blockBaseStyle, background: "#1f1d3d", color: "#ffffff" }}>
                 <p style={bodyStyle}>All requests to the VoicePilot API must be authenticated using a Bearer Token in the Authorization header.</p>
                 <div style={{ ...codeBlockStyle, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", marginTop: 24 }}>
                    <pre style={{ margin: 0, color: "#fff" }}>Authorization: Bearer YOUR_API_KEY</pre>
                 </div>
              </div>
           </section>

           {/* 4. API REFERENCE */}
           <section id="api-reference" style={docSectionStyle}>
              <h2 style={displayLgStyle}>API Reference</h2>
              <div style={endpointBoxStyle}>
                 <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                    <span style={methodPillStyle}>POST</span>
                    <code style={{ fontWeight: 600 }}>/v1/calls/create</code>
                 </div>
                 <p style={bodySmStyle}>Initiates a new voice call with a specified agent.</p>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
                    <div>
                       <p style={captionStyle}>REQUEST BODY</p>
                       <div style={codeBlockSmallStyle}>
{`{
  "agent_id": "abc123",
  "phone": "+91XXXXXXXXXX"
}`}
                       </div>
                    </div>
                    <div>
                       <p style={captionStyle}>RESPONSE</p>
                       <div style={codeBlockSmallStyle}>
{`{
  "call_id": "call_123",
  "status": "initiated"
}`}
                       </div>
                    </div>
                 </div>
              </div>
           </section>

           {/* 5. REAL-TIME / WEBSOCKETS */}
           <section id="realtime" style={docSectionStyle}>
              <h2 style={displayLgStyle}>Real-Time & WebSockets</h2>
              <div style={{ ...blockBaseStyle, background: "#c5b0f4" }}>
                 <p style={bodyStyle}>For sub-500ms latency, use our WebSocket protocol to stream audio chunks directly to the synthesis engine.</p>
                 <div style={{ ...codeBlockFullStyle, background: "rgba(0,0,0,0.8)", marginTop: 24 }}>
<pre style={{ margin: 0, color: "#a5d6ff" }}>
{`const ws = new WebSocket('wss://api.voicepilot.ai/v1/stream');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'start', agentId: '...' }));
};

ws.onmessage = (event) => {
  const audioChunk = event.data; // Binary audio
  play(audioChunk);
};`}
</pre>
                 </div>
              </div>
           </section>

           {/* 7. KNOWLEDGE BASE / RAG */}
           <section id="knowledge-base" style={docSectionStyle}>
              <h2 style={displayLgStyle}>Knowledge Base & RAG</h2>
              <p style={bodyStyle}>Equip your agents with custom data to handle complex queries without hallucination.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, marginTop: 40 }}>
                 <div style={featureCardStyle}>
                    <Database size={24} style={{ marginBottom: 16 }} />
                    <h4 style={headlineSmallStyle}>Vector Search</h4>
                    <p style={bodySmStyle}>We automatically chunk and embed your PDFs and TXT files for instant retrieval.</p>
                 </div>
                 <div style={featureCardStyle}>
                    <Zap size={24} style={{ marginBottom: 16 }} />
                    <h4 style={headlineSmallStyle}>Hybrid Retrieval</h4>
                    <p style={bodySmStyle}>Combining semantic search with keyword matching for 99% accuracy.</p>
                 </div>
              </div>
           </section>

           {/* 17. PLAYGROUND */}
           <section id="playground" style={docSectionStyle}>
              <div style={{ ...blockBaseStyle, background: "#dceeb1", textAlign: "center" }}>
                 <Play size={48} style={{ margin: "0 auto 24px" }} />
                 <h2 style={displayLgStyle}>Ready to experiment?</h2>
                 <p style={subheadStyle}>Try prompts, test voices, and view real-time latency in our interactive playground.</p>
                 <button style={{ ...pillButtonStyle, marginTop: 40 }}>
                    Open Playground <ExternalLink size={18} />
                 </button>
              </div>
           </section>

        </main>
      </div>

      <Footer />
    </div>
  )
}

/* ── Design Tokens ── */

const displayXlStyle: React.CSSProperties = {
  fontSize: 64,
  fontWeight: 340,
  lineHeight: 1.0,
  letterSpacing: "-1.28px",
  color: "#000000",
  marginBottom: 24,
}

const displayLgStyle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 340,
  lineHeight: 1.1,
  letterSpacing: "-0.96px",
  color: "#000000",
  marginBottom: 32,
  marginTop: 80,
}

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: "0.42px",
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.4)",
  marginBottom: 16,
}

const subheadStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 340,
  lineHeight: 1.35,
  letterSpacing: "-0.24px",
  color: "#111",
  marginBottom: 24,
}

const headlineStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.35,
  color: "#000000",
  marginBottom: 16,
}

const headlineSmallStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "#000000",
  marginBottom: 8,
}

const bodyStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 320,
  lineHeight: 1.6,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 24,
}

const bodySmStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 330,
  lineHeight: 1.5,
  color: "rgba(0,0,0,0.6)",
}

const captionStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: "rgba(0,0,0,0.4)",
  marginBottom: 12,
}

/* ── Layout Components ── */

const sidebarStyle: React.CSSProperties = {
  width: 300,
  height: "calc(100vh - 80px)",
  position: "sticky",
  top: 80,
  padding: "40px 0",
  borderRight: "1px solid #f1f1f1",
  overflowY: "auto",
}

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  padding: "40px 80px 120px",
  maxWidth: 900,
}

const searchContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "#f7f7f5",
  padding: "10px 16px",
  borderRadius: 8,
  marginRight: 24,
}

const searchInputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 14,
  outline: "none",
  width: "100%",
}

const navItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 16px",
  borderRadius: 8,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s ease",
  marginRight: 24,
}

const docSectionStyle: React.CSSProperties = {
  marginBottom: 120,
}

const blockBaseStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: 40,
}

const stepContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: 24,
  marginBottom: 40,
}

const stepCircleStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 99,
  background: "#000",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
}

const codeBlockStyle: React.CSSProperties = {
  background: "#f7f7f5",
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid #e6e6e6",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 12,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 14,
}

const codeBlockFullStyle: React.CSSProperties = {
  background: "#111",
  padding: 24,
  borderRadius: 12,
  marginTop: 12,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 14,
  overflowX: "auto",
}

const codeBlockSmallStyle: React.CSSProperties = {
  background: "#f7f7f5",
  padding: 16,
  borderRadius: 8,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  color: "#333",
  whiteSpace: "pre",
}

const endpointBoxStyle: React.CSSProperties = {
  border: "1px solid #f1f1f1",
  borderRadius: 16,
  padding: 32,
  marginTop: 24,
}

const methodPillStyle: React.CSSProperties = {
  background: "#000",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  padding: "4px 8px",
  borderRadius: 4,
}

const listStyle: React.CSSProperties = {
  paddingLeft: 20,
  display: "flex",
  flexDirection: "column",
  gap: 8,
}

const featureCardStyle: React.CSSProperties = {
  background: "#f7f7f5",
  padding: 32,
  borderRadius: 16,
  border: "1px solid #e6e6e6",
}

const pillButtonStyle: React.CSSProperties = {
  background: "#000000",
  color: "#ffffff",
  border: "none",
  borderRadius: 9999,
  padding: "16px 32px",
  fontSize: 16,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
}
