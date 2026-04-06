// src/pages/HR.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPopup from "./ChatPopup";
import "./Main.css";

function HR() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [repoMap, setRepoMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [current, setCurrent] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "", company_name: "", location: "",
    type: "Full-time", description: "", url: "",
  });
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
    const savedJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    setPostedJobs(savedJobs);
  }, []);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "hr") { navigate("/auth"); return; }
    setCurrent(currentUser);
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    const candidateProfiles = accounts
      .filter((acc) => acc.role === "candidate")
      .flatMap((acc) => acc.profiles || []);
    setCandidates(candidateProfiles);
  }, [navigate]);

  const chatUsers = useMemo(() => {
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    return accounts.map((acc) => ({
      id: acc.id,
      name: acc.profiles?.[0]?.name || acc.email || "No name",
      email: acc.email || "",
    }));
  }, []);

  useEffect(() => {
    const fetchRepos = async () => {
      const newRepoMap = {};
      for (const candidate of candidates) {
        if (!candidate.github) continue;
        let username = "";
        const match = candidate.github.trim().match(/github\.com\/([^/?#]+)/i);
        username = match?.[1] || candidate.github.trim();
        if (!username) continue;
        setLoadingMap((prev) => ({ ...prev, [candidate.id]: true }));
        try {
          const response = await fetch(`https://api.github.com/users/${username}/repos`);
          const repos = await response.json();
          newRepoMap[candidate.id] = Array.isArray(repos)
            ? repos.filter((r) => !r.fork).slice(0, 3)
            : [];
        } catch { newRepoMap[candidate.id] = []; }
        setLoadingMap((prev) => ({ ...prev, [candidate.id]: false }));
      }
      setRepoMap(newRepoMap);
    };
    if (candidates.length > 0) fetchRepos();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return candidates.filter((c) => {
      const matchSearch = !keyword ||
        (c.name || "").toLowerCase().includes(keyword) ||
        (c.email || "").toLowerCase().includes(keyword) ||
        (c.role || "").toLowerCase().includes(keyword) ||
        (Array.isArray(c.skills) ? c.skills.join(" ").toLowerCase() : "").includes(keyword);
      const matchRole = selectedRole === "All" || c.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [candidates, search, selectedRole]);

  const allRoles = useMemo(() => {
    const roles = new Set();
    candidates.forEach((c) => { if (c.role) roles.add(c.role); });
    return ["All", ...Array.from(roles).sort()];
  }, [candidates]);

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleJobChange = (e) =>
    setJobForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePostJob = () => {
    if (!jobForm.title.trim() || !jobForm.company_name.trim()) {
      alert("Job title and company are required.");
      return;
    }
    const newJob = {
      id: Date.now(),
      ...jobForm,
      title: jobForm.title.trim(),
      company_name: jobForm.company_name.trim(),
      location: jobForm.location.trim(),
      description: jobForm.description.trim(),
      url: jobForm.url.trim(),
      source: "HR Posting",
      createdAt: new Date().toISOString(),
    };
    const updatedJobs = [newJob, ...postedJobs];
    setPostedJobs(updatedJobs);
    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));
    setJobForm({ title: "", company_name: "", location: "", type: "Full-time", description: "", url: "" });
    setShowJobForm(false);
  };

  const deletePostedJob = (jobId) => {
    const updatedJobs = postedJobs.filter((j) => j.id !== jobId);
    setPostedJobs(updatedJobs);
    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <span className="navbar-user">
            {current?.profiles?.[0]?.name || current?.email || "HR"}
          </span>
          <button className="btn" onClick={() => navigate("/favorites")}>
            ⭐ Saved
          </button>
          <button
            className="btn-logout"
            onClick={() => { localStorage.removeItem("currentUser"); navigate("/auth"); }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="page">

        {/* ── Page header ── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="section-subtitle">HR Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Find Candidates
          </h1>
        </div>

        {/* ── Post a Job ── */}
        <div className="form-card" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Post a Job</h2>
            <button className="btn" onClick={() => setShowJobForm((v) => !v)}>
              {showJobForm ? "− Collapse" : "+ New Job"}
            </button>
          </div>

          {showJobForm && (
            <div className="form-grid fade-up">
              <input className="form-input" name="title" placeholder="Job Title" value={jobForm.title} onChange={handleJobChange} />
              <input className="form-input" name="company_name" placeholder="Company Name" value={jobForm.company_name} onChange={handleJobChange} />
              <input className="form-input" name="location" placeholder="Location" value={jobForm.location} onChange={handleJobChange} />
              <select className="form-select" name="type" value={jobForm.type} onChange={handleJobChange}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
              </select>
              <textarea className="form-textarea" name="description" placeholder="Job Description" value={jobForm.description} onChange={handleJobChange} />
              <input className="form-input" name="url" placeholder="Apply Link (optional)" value={jobForm.url} onChange={handleJobChange} />
              <button className="btn btn-primary" onClick={handlePostJob} style={{ justifySelf: "start" }}>
                Post Job
              </button>
            </div>
          )}

          {/* Posted jobs list */}
          {postedJobs.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <p className="repo-label">My Posted Jobs ({postedJobs.length})</p>
              <div className="grid-jobs">
                {postedJobs.map((job) => (
                  <div key={job.id} className="card" style={{ padding: "1rem" }}>
                    <p className="job-company">{job.company_name}</p>
                    <p className="job-title">{job.title}</p>
                    <p className="job-meta">
                      {job.location || "Remote"} · {job.type}
                    </p>
                    {job.description && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.8rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.description}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button className="btn" style={{ fontSize: "0.68rem", padding: "5px 10px" }}
                        onClick={() => navigate(`/job/view/${job.id}`, { state: { job } })}>
                        View
                      </button>
                      <button className="btn" style={{ fontSize: "0.68rem", padding: "5px 10px" }}
                        onClick={() => navigate(`/job/edit/${job.id}`, { state: { job } })}>
                        Edit
                      </button>
                      <button className="btn btn-danger" style={{ fontSize: "0.68rem", padding: "5px 10px" }}
                        onClick={() => deletePostedJob(job.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="divider" />

        {/* ── Candidates section ── */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p className="section-subtitle">Talent Pool</p>
          <h2 className="section-title">Browse Candidates</h2>
        </div>

        {/* ── Search & Filter ── */}
        <div className="filter-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, skill, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {allRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginLeft: "auto" }}>
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Candidate cards ── */}
        {filteredCandidates.length === 0 ? (
          <p className="empty">No matching candidates found.</p>
        ) : (
          <div className="grid-candidates">
            {filteredCandidates.map((candidate, i) => (
              <div
                key={candidate.id}
                className="card fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                  <div>
                    <p className="candidate-name">{candidate.name || "No Name"}</p>
                    <p className="candidate-role">{candidate.role || "—"}</p>
                  </div>
                  <button
                    className={`btn-fav ${favorites.includes(candidate.id) ? "active" : ""}`}
                    onClick={() => toggleFavorite(candidate.id)}
                  >
                    {favorites.includes(candidate.id) ? "💖" : "🤍"}
                  </button>
                </div>

                {/* Meta */}
                <p className="candidate-meta">✉ {candidate.email || "N/A"}</p>

                {/* Skills */}
                {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                  <div style={{ margin: "0.8rem 0" }}>
                    {candidate.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="tag">{skill}</span>
                    ))}
                    {candidate.skills.length > 5 && (
                      <span className="tag" style={{ opacity: 0.5 }}>+{candidate.skills.length - 5}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="candidate-actions">
                  <button className="btn btn-primary" style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                    onClick={() => navigate(`/hr/view/${candidate.id}`, { state: { user: candidate } })}>
                    View Profile
                  </button>
                  {candidate.github && (
                    <a href={candidate.github} target="_blank" rel="noreferrer"
                      style={{ textDecoration: "none" }}>
                      <button className="btn" style={{ fontSize: "0.7rem", padding: "6px 14px" }}>
                        GitHub ↗
                      </button>
                    </a>
                  )}
                </div>

                {/* GitHub Repos */}
                <div className="repo-section">
                  <p className="repo-label">GitHub Projects</p>
                  {loadingMap[candidate.id] ? (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Fetching repos...</p>
                  ) : !repoMap[candidate.id] || repoMap[candidate.id].length === 0 ? (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>No public repos found</p>
                  ) : (
                    repoMap[candidate.id].map((repo) => (
                      <div key={repo.id} className="repo-item">
                        <p className="repo-name">{repo.name}</p>
                        <p className="repo-desc">{repo.description || "No description"}</p>
                        <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-link">
                          View on GitHub ↗
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChatPopup
        currentUser={{
          id: current?.id,
          name: current?.profiles?.[0]?.name?.trim() || current?.email || "No name",
        }}
        users={chatUsers}
      />
    </div>
  );
}

export default HR;