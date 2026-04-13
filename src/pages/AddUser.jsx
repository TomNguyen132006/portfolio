// src/pages/AddUser.jsx
import { useState } from "react";
import "./Main.css";

function AddUser({ users, setUsers }) {
  const [form, setForm] = useState({
    name: "", role: "", skills: "", github: "", linkedin: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanGithub = form.github
      .replace("https://github.com/", "")
      .split("?")[0]
      .trim();

    const cleanLinkedin = form.linkedin.startsWith("http")
      ? form.linkedin
      : form.linkedin ? "https://" + form.linkedin : "";

    const newUser = {
      id: Date.now(),
      name: form.name.trim(),
      role: form.role.trim(),
      github: cleanGithub,
      linkedin: cleanLinkedin,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setForm({ name: "", role: "", skills: "", github: "", linkedin: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const fieldLabel = (text) => (
    <p style={{
      fontSize: "0.68rem", letterSpacing: "0.08em",
      textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px",
    }}>
      {text}
    </p>
  );

  return (
    <div className="card" style={{ padding: "2rem" }}>

      {/* ── Header ── */}
      <p className="repo-label" style={{ marginBottom: "1.2rem" }}>Add New User</p>

      <div className="form-grid">

        <div>
          {fieldLabel("Full Name *")}
          <input
            className="form-input"
            name="name"
            placeholder="e.g. Alex Rivera"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          {fieldLabel("Role *")}
          <input
            className="form-input"
            name="role"
            placeholder="e.g. Frontend Developer"
            value={form.role}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          {fieldLabel("Skills")}
          <input
            className="form-input"
            name="skills"
            placeholder="e.g. React, Python, Node.js"
            value={form.skills}
            onChange={handleChange}
          />
          <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: "4px" }}>
            Separate with commas
          </p>
        </div>

        <div>
          {fieldLabel("GitHub Username")}
          <input
            className="form-input"
            name="github"
            placeholder="e.g. octocat"
            value={form.github}
            onChange={handleChange}
          />
        </div>

        <div>
          {fieldLabel("LinkedIn URL")}
          <input
            className="form-input"
            name="linkedin"
            placeholder="linkedin.com/in/yourname"
            value={form.linkedin}
            onChange={handleChange}
          />
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        marginTop: "1.5rem", paddingTop: "1.5rem",
        borderTop: "1px solid var(--border)",
      }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!form.name.trim() || !form.role.trim()}
          style={{ opacity: !form.name.trim() || !form.role.trim() ? 0.5 : 1 }}
        >
          Add User
        </button>

        {submitted && (
          <span style={{
            fontSize: "0.78rem", color: "#16a34a",
            fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
          }}>
            ✓ User added successfully
          </span>
        )}
      </div>

    </div>
  );
}

export default AddUser;