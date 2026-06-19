import { Link } from "@tanstack/react-router";

const sections = [
  {
    title: "PRODUCT",
    links: [
      { to: "/features", label: "Features" },
      { to: "/pricing", label: "Pricing" },
      { to: "/changelog", label: "Changelog" },
      { to: "/roadmap", label: "Roadmap" },
    ],
  },
  {
    title: "DEVELOPERS",
    links: [
      { to: "/docs", label: "Documentation" },
      { to: "/api-reference", label: "API Reference" },
      { to: "/sdks", label: "SDKs" },
      { to: "/status", label: "Status" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { to: "/about", label: "About" },
      { to: "/customers", label: "Customers" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/security", label: "Security" },
      { to: "/dpa", label: "DPA" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer style={{ background: "#ffffff", color: "#000000", borderTop: "1px solid #e6e6e6", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 64 }}>
          {/* Brand Column */}
          <div style={{ flex: "1 1 300px" }}>
            <Link to="/" style={{ textDecoration: "none", color: "#000000", display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <img src="/logo.png" alt="Logo" style={{ height: 44, width: 44, objectFit: "contain" }} />
              <span style={{ fontSize: 36, fontWeight: 340, letterSpacing: "-0.03em" }}>GAP VoicePilot</span>
            </Link>
            <p style={{ fontSize: 16, fontWeight: 320, lineHeight: 1.55, color: "#666", maxWidth: 280, marginBottom: 32 }}>
              Production-grade voice AI for calls, automation, and conversational workflows.
            </p>
            <div style={{ display: "flex", gap: 24, fontSize: 13, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <a href="#" style={{ color: "#000000", textDecoration: "none" }}>Twitter</a>
              <a href="#" style={{ color: "#000000", textDecoration: "none" }}>GitHub</a>
              <a href="#" style={{ color: "#000000", textDecoration: "none" }}>LinkedIn</a>
            </div>
          </div>

          {/* Links Grid */}
          <div style={{ flex: "2 1 500px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "48px 24px" }}>
            {sections.map((s) => (
              <div key={s.title}>
                <h4 style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 12, fontWeight: 400, letterSpacing: "0.1em", color: "#999", marginBottom: 24, textTransform: "uppercase" }}>
                  {s.title}
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  {s.links.map(l => (
                    <li key={l.label}>
                      <Link to={l.to} style={{ fontSize: 15, fontWeight: 320, color: "#444", textDecoration: "none" }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ marginTop: 96, paddingTop: 32, borderTop: "1px solid #e6e6e6", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#999", fontWeight: 320 }}>
          <p>© 2026 metabull universe. All rights reserved.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#1ea64a" }} />
            All systems operational
          </div>
        </div>

      </div>
    </footer>
  );
}
