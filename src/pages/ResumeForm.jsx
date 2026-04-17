// src/pages/ResumeForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./Main.css";

function ResumeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    name: "", role: "", category: "", location: "",
    education: "", summary: "", skills: "",
    certifications: "", licenses: "",
    linkedin: "", github: "", resumeName: "", resumeFile: "",
  });

  const formatUrl = (url) => {
    const trimmed = (url || "").trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed : "https://" + trimmed;
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm((prev) => ({ ...prev, resumeName: file.name, resumeFile: reader.result }));
    reader.readAsDataURL(file);
  };

  const removeResume = () =>
    setForm((prev) => ({ ...prev, resumeName: "", resumeFile: "" }));

  const toArray = (value) =>
    (value || "").split(",").map((item) => item.trim()).filter(Boolean);

  useEffect(() => {
    if (!isEditMode) return;
    let profile = location.state?.user;
    if (!profile) {
      const current = JSON.parse(localStorage.getItem("currentUser"));
      profile = (current?.profiles || []).find((p) => String(p.id) === String(id));
    }
    if (profile) {
      setForm({
        name: profile.name || "",
        role: profile.role || "",
        category: profile.category || "",
        location: profile.location || "",
        education: profile.education || "",
        summary: profile.summary || "",
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
        certifications: Array.isArray(profile.certifications) ? profile.certifications.join(", ") : "",
        licenses: Array.isArray(profile.licenses) ? profile.licenses.join(", ") : "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        resumeName: profile.resumeName || "",
        resumeFile: profile.resumeFile || "",
      });
    }
  }, [id, isEditMode, location.state]);

  const handleSave = () => {
    const current = JSON.parse(localStorage.getItem("currentUser"));
    if (!current) { alert("No current user found."); return; }
    if (!form.name.trim() || !form.role.trim()) { alert("Name and role are required."); return; }

    let updatedProfiles;
    if (isEditMode) {
      updatedProfiles = (current.profiles || []).map((profile) =>
        String(profile.id) === String(id)
          ? {
              ...profile,
              name: form.name.trim(), role: form.role.trim(),
              category: form.category.trim(), location: form.location.trim(),
              education: form.education.trim(), summary: form.summary.trim(),
              skills: toArray(form.skills),
              certifications: toArray(form.certifications),
              licenses: toArray(form.licenses),
              linkedin: formatUrl(form.linkedin),
              github: formatUrl(form.github),
              resumeName: form.resumeName, resumeFile: form.resumeFile,
            }
          : profile
      );
    } else {
      const newProfile = {
        id: Date.now(), email: current.email,
        name: form.name.trim(), role: form.role.trim(),
        category: form.category.trim(), location: form.location.trim(),
        education: form.education.trim(), summary: form.summary.trim(),
        skills: toArray(form.skills),
        certifications: toArray(form.certifications),
        licenses: toArray(form.licenses),
        linkedin: formatUrl(form.linkedin),
        github: formatUrl(form.github),
        resumeName: form.resumeName, resumeFile: form.resumeFile,
      };
      updatedProfiles = [...(current.profiles || []), newProfile];
    }

    const updatedCurrent = { ...current, profiles: updatedProfiles };
    localStorage.setItem("currentUser", JSON.stringify(updatedCurrent));
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const updatedAccounts = accounts.map((acc) => acc.id === updatedCurrent.id ? updatedCurrent : acc);
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
    navigate("/candidate");
  };

  const fieldLabel = (text) => (
    <p style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
      {text}
    </p>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <button className="btn" onClick={() => navigate(-1)}>← Cancel</button>
        </div>
      </nav>

      <div className="page" style={{ maxWidth: "760px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-subtitle">Candidate Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            {isEditMode ? "Edit Profile" : "Create Profile"}
          </h1>
        </div>

        {/* ── Basic Info ── */}
        <div className="card fade-up" style={{ padding: "2rem", marginBottom: "1.2rem" }}>
          <p className="repo-label" style={{ marginBottom: "1.2rem" }}>Basic Information</p>
          <div className="form-grid">
            <div>
              {fieldLabel("Full Name *")}
              <input className="form-input" name="name" placeholder="e.g. Alex Rivera" value={form.name} onChange={handleChange} />
            </div>
            <div>
              {fieldLabel("Job Role *")}
              <input className="form-input" name="role" placeholder="e.g. Software Engineer, Nurse, Accountant" value={form.role} onChange={handleChange}/>
            </div>
            <div>
              {fieldLabel("Field of Work")}
              <input className="form-input" name="category" placeholder="e.g. Engineering, Design" value={form.category} onChange={handleChange} />
            </div>
            <div>
              {fieldLabel("Location")}
              <input className="form-input" name="location" placeholder="e.g. New York" value={form.location} onChange={handleChange} />
            </div>
            <div>
              {fieldLabel("Education")}
              <input className="form-input" name="education" placeholder="e.g. Missouri State University, University of Wisconsin" value={form.education} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* ── Summary ── */}
        <div className="card fade-up" style={{ animationDelay: "0.06s", padding: "2rem", marginBottom: "1.2rem" }}>
          <p className="repo-label" style={{ marginBottom: "1.2rem" }}>Professional Summary</p>
          {fieldLabel("Summary")}
          <textarea
            className="form-textarea"
            name="summary"
            placeholder="Write a short professional summary about yourself..."
            value={form.summary}
            onChange={handleChange}
            rows={5}
          />
        </div>

        {/* ── Skills & Credentials ── */}
        <div className="card fade-up" style={{ animationDelay: "0.1s", padding: "2rem", marginBottom: "1.2rem" }}>
          <p className="repo-label" style={{ marginBottom: "1.2rem" }}>Skills & Credentials</p>
          <div className="form-grid">
            <div>
              {fieldLabel("Skills")}
              <input className="form-input" name="skills" placeholder="e.g. React, Node.js, Python" value={form.skills} onChange={handleChange} />
              <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: "4px" }}>Separate with commas</p>
            </div>
            <div>
              {fieldLabel("Certifications")}
              <input className="form-input" name="certifications" placeholder="e.g. AWS Certified, Google Cloud" value={form.certifications} onChange={handleChange} />
              <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: "4px" }}>Separate with commas</p>
            </div>
            <div>
              {fieldLabel("Licenses")}
              <input className="form-input" name="licenses" placeholder="e.g. PMP, CPA" value={form.licenses} onChange={handleChange} />
              <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: "4px" }}>Separate with commas</p>
            </div>
          </div>
        </div>

        {/* ── Links ── */}
        <div className="card fade-up" style={{ animationDelay: "0.14s", padding: "2rem", marginBottom: "1.2rem" }}>
          <p className="repo-label" style={{ marginBottom: "1.2rem" }}>Links</p>
          <div className="form-grid">
            <div>
              {fieldLabel("LinkedIn")}
              <input className="form-input" name="linkedin" placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={handleChange} />
            </div>
            <div>
              {fieldLabel("GitHub")}
              <input className="form-input" name="github" placeholder="github.com/yourUserName" value={form.github} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* ── Resume Upload ── */}
        <div className="card fade-up" style={{ animationDelay: "0.18s", padding: "2rem", marginBottom: "2rem" }}>
          <p className="repo-label" style={{ marginBottom: "1.2rem" }}>Resume</p>

          {!form.resumeFile ? (
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: "2px dashed var(--border)", borderRadius: "var(--radius)",
              padding: "2.5rem", cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
              background: "var(--bg)",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-light)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
            >
              <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📄</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                Click to upload your resume
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>PDF only</p>
              <input type="file" accept="application/pdf" onChange={handleResumeUpload} style={{ display: "none" }} />
            </label>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>📄</span>
                  <p style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 500 }}>
                    {form.resumeName}
                  </p>
                </div>
                <button className="btn btn-danger" style={{ fontSize: "0.7rem", padding: "5px 12px" }} onClick={removeResume}>
                  Remove
                </button>
              </div>
              <iframe
                src={form.resumeFile}
                title="Resume Preview"
                width="100%"
                height="420px"
                style={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)" }}
              />
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div style={{ display: "flex", gap: "10px", paddingBottom: "3rem" }}>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEditMode ? "Update Profile" : "Save Profile"}
          </button>
          <button className="btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResumeForm;