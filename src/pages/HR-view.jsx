// src/pages/HR-view.jsx
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./Main.css";

function HRview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const candidate =
    location.state?.user ||
    JSON.parse(localStorage.getItem("accounts"))
      ?.flatMap((acc) => acc.profiles || [])
      ?.find((profile) => String(profile.id) === String(id));

  if (!candidate) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <nav className="navbar">
          <span className="navbar-logo">PortfolioHub</span>
        </nav>
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.2rem" }}>No candidate data found.</p>
          <button className="btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Email",          value: candidate.email },
    { label: "Role",           value: candidate.role },
    { label: "Category",       value: candidate.category },
    { label: "Location",       value: candidate.location },
    { label: "Education",      value: candidate.education },
    { label: "Summary",        value: candidate.summary },
    { label: "Certifications", value: Array.isArray(candidate.certifications) ? candidate.certifications.join(", ") : candidate.certifications },
    { label: "Licenses",       value: Array.isArray(candidate.licenses) ? candidate.licenses.join(", ") : candidate.licenses },
  ];

  const links = [
    { label: "GitHub",    href: candidate.github },
    { label: "LinkedIn",  href: candidate.linkedin },
    { label: "Portfolio", href: candidate.portfolio },
  ].filter((l) => l.href);

  const skills = Array.isArray(candidate.skills)
    ? candidate.skills
    : candidate.skills?.split(",").map((s) => s.trim()) || [];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </nav>

      <div className="page" style={{ maxWidth: "800px" }}>

        {/* ── Header card ── */}
        <div className="card fade-up" style={{ marginBottom: "1.5rem", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p className="section-subtitle">Candidate Profile</p>
              <h1 style={{ fontFamily: "var(--font-head)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.01em", marginBottom: "4px" }}>
                {candidate.name || "No Name"}
              </h1>
              <p className="candidate-role">{candidate.role || "—"}</p>
            </div>

            {/* External links */}
            {links.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {links.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <button className="btn" style={{ fontSize: "0.72rem" }}>
                      {link.label} ↗
                    </button>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginTop: "1.2rem", paddingTop: "1.2rem", borderTop: "1px solid var(--border)" }}>
              <p className="repo-label">Skills</p>
              <div>
                {skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Details grid ── */}
        <div className="card fade-up" style={{ animationDelay: "0.08s", padding: "2rem", marginBottom: "1.5rem" }}>
          <p className="repo-label" style={{ marginBottom: "1.2rem" }}>Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.2rem" }}>
            {fields.map((field) => (
              field.value ? (
                <div key={field.label}>
                  <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "4px" }}>
                    {field.label}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5 }}>
                    {field.value}
                  </p>
                </div>
              ) : null
            ))}
          </div>
        </div>

        {/* ── Summary (full width if long) ── */}
        {candidate.summary && (
          <div className="card fade-up" style={{ animationDelay: "0.12s", padding: "2rem", marginBottom: "1.5rem" }}>
            <p className="repo-label" style={{ marginBottom: "0.8rem" }}>Summary</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              {candidate.summary}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default HRview;