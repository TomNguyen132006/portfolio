// src/pages/Compare.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Main.css";

function Compare() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const selected = state?.selected || [];

  const [favorites, setFavorites] = useState([]);
  const [list, setList] = useState(selected);

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem("favorites")) || []);
  }, []);

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const removeCandidate = (id) => setList((prev) => prev.filter((p) => p.id !== id));

  // All unique skills across all candidates
  const allSkills = [...new Set(list.flatMap((u) => u.skills || []))].sort();

  // Match score based on shared skills with first candidate
  const getScore = (skills = []) => {
    const base = list[0]?.skills || [];
    if (!base.length) return 0;
    const match = skills.filter((s) => base.includes(s));
    return Math.round((match.length / base.length) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#16a34a";
    if (score >= 40) return "#d97706";
    return "#dc2626";
  };

  if (list.length < 2) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <nav className="navbar">
          <span className="navbar-logo">PortfolioHub</span>
          <div className="navbar-right">
            <button className="btn" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </nav>
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>⚖️</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.2rem" }}>
            Select at least 2 candidates to compare.
          </p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <span className="navbar-user">Comparing {list.length} candidates</span>
          <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </nav>

      <div className="page">

        {/* ── Header ── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="section-subtitle">HR Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Compare Candidates
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "6px" }}>
            Match score is calculated against the first candidate's skill set.
          </p>
        </div>

        {/* ── Candidate columns ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${list.length}, minmax(260px, 1fr))`,
          gap: "1.2rem",
          marginBottom: "2.5rem",
          overflowX: "auto",
        }}>
          {list.map((user, i) => {
            const score = i === 0 ? 100 : getScore(user.skills || []);
            return (
              <div key={user.id} className="card fade-up" style={{
                animationDelay: `${i * 0.06}s`,
                position: "relative",
                borderTop: i === 0 ? "3px solid var(--accent)" : "3px solid var(--border)",
              }}>

                {/* ── Remove button ── */}
                {list.length > 2 && (
                  <button
                    onClick={() => removeCandidate(user.id)}
                    style={{
                      position: "absolute", top: "12px", right: "12px",
                      width: "24px", height: "24px", borderRadius: "50%",
                      border: "1.5px solid var(--border)",
                      background: "var(--bg)", color: "var(--text-muted)",
                      fontSize: "0.7rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = "var(--danger)"; e.target.style.color = "var(--danger)"; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-muted)"; }}
                    title="Remove from comparison"
                  >
                    ✕
                  </button>
                )}

                {/* ── Baseline label ── */}
                {i === 0 && (
                  <span style={{
                    fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--accent)", fontWeight: 600, display: "block", marginBottom: "0.6rem",
                  }}>
                    Baseline
                  </span>
                )}

                {/* ── Name & role ── */}
                <div style={{ marginBottom: "1rem", paddingRight: "2rem" }}>
                  <p className="candidate-name">{user.name || "No Name"}</p>
                  <p className="candidate-role">{user.role || "—"}</p>
                </div>

                {/* ── Match score ── */}
                {i !== 0 && (
                  <div style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      Match Score
                    </span>
                    <span style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem", fontWeight: 800, color: getScoreColor(score) }}>
                      {score}%
                    </span>
                  </div>
                )}

                {/* ── Skills ── */}
                <div style={{ marginBottom: "1rem" }}>
                  <p className="repo-label" style={{ marginBottom: "6px" }}>Skills</p>
                  <div>
                    {(user.skills || []).length === 0 ? (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>No skills listed</p>
                    ) : (
                      (user.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="tag"
                          style={{
                            // highlight skills NOT shared with baseline
                            opacity: i > 0 && !(list[0]?.skills || []).includes(skill) ? 0.4 : 1,
                          }}
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                  {i > 0 && (
                    <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: "6px" }}>
                      Faded = not in baseline
                    </p>
                  )}
                </div>

                {/* ── Favorite & links ── */}
                <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                  <div className="candidate-actions">
                    <button
                      className={`btn-fav ${favorites.includes(user.id) ? "active" : ""}`}
                      onClick={() => toggleFavorite(user.id)}
                    >
                      {favorites.includes(user.id) ? "💖 Saved" : "🤍 Save"}
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                      onClick={() => navigate(`/hr/view/${user.id}`, { state: { user } })}
                    >
                      View Profile
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                    {user.github && (
                      <a href={user.github} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ fontSize: "0.68rem", padding: "5px 10px" }}>GitHub ↗</button>
                      </a>
                    )}
                    {user.linkedin && (
                      <a href={user.linkedin} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ fontSize: "0.68rem", padding: "5px 10px" }}>LinkedIn ↗</button>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Skills matrix ── */}
        {allSkills.length > 0 && (
          <>
            <div className="divider" />
            <div style={{ marginBottom: "1.5rem" }}>
              <p className="section-subtitle">Skill Matrix</p>
              <h2 className="section-title">Side-by-side Skills</h2>
            </div>

            <div className="card fade-up" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
                      Skill
                    </th>
                    {list.map((user) => (
                      <th key={user.id} style={{ textAlign: "center", padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>
                        {user.name?.split(" ")[0] || "—"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSkills.map((skill, i) => (
                    <tr
                      key={skill}
                      style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg)" }}
                    >
                      <td style={{ padding: "9px 14px", color: "var(--text)", fontWeight: 500 }}>
                        {skill}
                      </td>
                      {list.map((user) => (
                        <td key={user.id} style={{ textAlign: "center", padding: "9px 14px" }}>
                          {(user.skills || []).includes(skill) ? (
                            <span style={{ color: "#16a34a", fontSize: "1rem" }}>✓</span>
                          ) : (
                            <span style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Compare;