// src/pages/JobEdit.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Main.css";

function JobEdit() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const job = state?.job;

  const [form, setForm] = useState({
    title:        job?.title        || "",
    company_name: job?.company_name || "",
    location:     job?.location     || "",
    role:         job?.role         || "",
    type:         job?.type         || "Full-time",
    description:  job?.description  || "",
    url:          job?.url          || "",
  });

  if (!job) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <nav className="navbar">
          <span className="navbar-logo">PortfolioHub</span>
        </nav>
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.2rem" }}>Job not found.</p>
          <button className="btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    const jobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    const updatedJobs = jobs.map((j) => j.id === job.id ? { ...j, ...form } : j);
    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));
    navigate("/hr");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <button className="btn" onClick={() => navigate(-1)}>← Cancel</button>
        </div>
      </nav>

      <div className="page" style={{ maxWidth: "700px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-subtitle">HR Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Edit Job
          </h1>
        </div>

        {/* ── Form card ── */}
        <div className="card fade-up" style={{ padding: "2rem" }}>

          <div className="form-grid">

            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                Job Title
              </p>
              <input
                className="form-input"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Engineer"
              />
            </div>

            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                Company Name
              </p>
              <input
                className="form-input"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                Location
              </p>
              <input
                className="form-input"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York"
              />
            </div>

            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                Job Type
              </p>
              <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                Role
              </p>
              <input
                className="form-input"
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Sale, Nurse"
              />

            <div>

            </div>

            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                Description
              </p>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, requirements..."
                rows={5}
              />
            </div>

            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                Apply Link
              </p>
              <input
                className="form-input"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

          </div>

          {/* ── Footer actions ── */}
          <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default JobEdit;