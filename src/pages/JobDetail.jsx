// src/pages/JobDetail.jsx
import { useLocation, useNavigate } from "react-router-dom";
import "./Main.css";

function JobDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const job = state?.job;

  // 🔴 Handle missing job (refresh / direct URL)
  if (!job) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <nav className="navbar">
          <span className="navbar-logo">PortfolioHub</span>
        </nav>

        <div
          className="page"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <p style={{ color: "var(--text-muted)", marginBottom: "1.2rem" }}>
            Job not found.
          </p>
          <button className="btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Get poster info from localStorage
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  const postedBy = accounts.find(
    (acc) => String(acc.id) === String(job.ownerId)
  );

  const posterName =
    postedBy?.profiles?.[0]?.name ||
    postedBy?.email ||
    "Unknown HR";

  // 🔹 Google fallback
  const searchGoogle = () => {
    const q = encodeURIComponent(`${job.company_name} ${job.title}`);
    window.open(`https://www.google.com/search?q=${q}`, "_blank");
  };

  // 🔹 Fields display
  const fields = [
    { label: "Company", value: job.company_name },
    { label: "Posted By", value: posterName }, // ✅ NEW
    { label: "Location", value: job.location },
    { label: "Type", value: job.type },
    { label: "Source", value: job.source },
    {
      label: "Posted",
      value: job.createdAt
        ? new Date(job.createdAt).toLocaleDateString()
        : null,
    },
  ].filter((f) => f.value);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <button className="btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </nav>

      <div className="page" style={{ maxWidth: "800px" }}>
        {/* ── Header card ── */}
        <div
          className="card fade-up"
          style={{ padding: "2rem", marginBottom: "1.5rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p className="section-subtitle">Job Posting</p>

              <h1
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1.9rem",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  marginBottom: "6px",
                  color: "#0f172a",
                }}
              >
                {job.title}
              </h1>

              <p className="candidate-role">{job.company_name}</p>
            </div>

            {/* Apply / Search */}
            <div>
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <button className="btn btn-primary">
                    Apply Now ↗
                  </button>
                </a>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={searchGoogle}
                >
                  Search Job ↗
                </button>
              )}
            </div>
          </div>

          {/* ── Meta fields ── */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              marginTop: "1.5rem",
              paddingTop: "1.2rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            {fields.map((f) => (
              <div key={f.label}>
                <p
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                    marginBottom: "3px",
                  }}
                >
                  {f.label}
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text)",
                    fontWeight: 500,
                  }}
                >
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        {job.description && (
          <div
            className="card fade-up"
            style={{ animationDelay: "0.08s", padding: "2rem" }}
          >
            <p
              className="repo-label"
              style={{ marginBottom: "0.8rem" }}
            >
              Job Description
            </p>

            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}
            >
              {job.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetail;