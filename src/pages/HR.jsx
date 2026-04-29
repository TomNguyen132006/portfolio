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
    title: "",
    company_name: "",
    location: "",
    type: "Full-time",
    description: "",
    url: "",
  });
  const [showJobForm, setShowJobForm] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [authFilter, setAuthFilter] = useState("All");


  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "hr") {
      navigate("/auth");
      return;
    }

    setCurrent(currentUser);

    const allJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    const myJobs = allJobs.filter((job) => job.ownerId === currentUser.id);
    setPostedJobs(myJobs);

    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");

    const candidateAccounts = accounts
      .filter((acc) => acc.role === "candidate")
      .map((acc) => {
        const profiles = Array.isArray(acc.profiles) ? acc.profiles : [];

        const mainProfile =
          profiles.find(
            (p) => String(p.id) === String(acc.primaryProfileId)
          ) || profiles[0] || null;

        const otherProfiles = profiles.filter(
          (p) => String(p.id) !== String(mainProfile?.id)
        );

        return {
          ...acc,
          mainProfile,
          otherProfiles,
        };
      })
      .filter((acc) => acc.mainProfile);

    setCandidates(candidateAccounts);
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
        const profile = candidate.mainProfile;
        if (!profile?.github) continue;

        const match = profile.github.trim().match(/github\.com\/([^/?#]+)/i);
        const username = match?.[1] || profile.github.trim();
        if (!username) continue;

        setLoadingMap((prev) => ({ ...prev, [candidate.id]: true }));

        try {
          const response = await fetch(
            `https://api.github.com/users/${username}/repos`
          );
          const repos = await response.json();

          newRepoMap[candidate.id] = Array.isArray(repos)
            ? repos.filter((r) => !r.fork).slice(0, 3)
            : [];
        } catch {
          newRepoMap[candidate.id] = [];
        }

        setLoadingMap((prev) => ({ ...prev, [candidate.id]: false }));
      }

      setRepoMap(newRepoMap);
    };

    if (candidates.length > 0) fetchRepos();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return candidates.filter((candidate) => {
      const profile = candidate.mainProfile;
      if (!profile) return false;

      const skillsText = Array.isArray(profile.skills)
        ? profile.skills.join(" ").toLowerCase()
        : (profile.skills || "").toLowerCase();

      const matchSearch =
        !keyword ||
        (profile.name || "").toLowerCase().includes(keyword) ||
        (candidate.email || "").toLowerCase().includes(keyword) ||
        (profile.role || "").toLowerCase().includes(keyword) ||
        skillsText.includes(keyword);

      const matchRole =
        selectedRole === "All" || profile.role === selectedRole;

      // ✅ NEW: Work Authorization filter
      const matchAuth =
        authFilter === "All" ||
        profile.workAuthorization === authFilter ||
        profile.needsSponsorship === authFilter ||
        profile.optStatus === authFilter;

      // ✅ NEW: Country filter
      

      return matchSearch && matchRole && matchAuth;
    });
  }, [candidates, search, selectedRole, authFilter]);

  const allRoles = useMemo(() => {
    const roles = new Set();
    candidates.forEach((candidate) => {
      if (candidate.mainProfile?.role) {
        roles.add(candidate.mainProfile.role);
      }
    });
    return ["All", ...Array.from(roles).sort()];
  }, [candidates]);

  const toggleFavorite = (candidateId) => {
    const updated = favorites.includes(candidateId)
      ? favorites.filter((f) => f !== candidateId)
      : [...favorites, candidateId];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const toggleCompare = (candidate) => {
    const profileToCompare = {
        ...candidate.mainProfile,
        id: candidate.id,
        email: candidate.email,
    };

    setCompareList((prev) =>
      prev.find((c) => c.id === candidate.id)
        ? prev.filter((c) => c.id !== candidate.id)
        : prev.length < 4 ? [...prev, profileToCompare] : prev
    );
  };

  const handleJobChange = (e) => {
    setJobForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePostJob = () => {
    if (!jobForm.title.trim() || !jobForm.company_name.trim()) {
      alert("Job title and company are required.");
      return;
    }

    const newJob = {
      id: Date.now(),
      ownerId: current.id,
      ...jobForm,
      title: jobForm.title.trim(),
      company_name: jobForm.company_name.trim(),
      location: jobForm.location.trim(),
      description: jobForm.description.trim(),
      url: jobForm.url.trim(),
      source: "HR Posting",
      createdAt: new Date().toISOString(),
    };

    const allJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    const updatedAll = [newJob, ...allJobs];

    localStorage.setItem("postedJobs", JSON.stringify(updatedAll));
    setPostedJobs((prev) => [newJob, ...prev]);

    setJobForm({
      title: "",
      company_name: "",
      location: "",
      type: "Full-time",
      description: "",
      url: "",
    });
    setShowJobForm(false);
  };

  const deletePostedJob = (jobId) => {
    const allJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    const updatedAll = allJobs.filter((j) => j.id !== jobId);

    localStorage.setItem("postedJobs", JSON.stringify(updatedAll));
    setPostedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
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
            onClick={() => {
              localStorage.removeItem("currentUser");
              navigate("/auth");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="page">
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="section-subtitle">HR Dashboard</p>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            Find Candidates
          </h1>
        </div>

        <div className="form-card" style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Post a Job
            </h2>
            <button className="btn" onClick={() => setShowJobForm((v) => !v)}>
              {showJobForm ? "− Collapse" : "+ New Job"}
            </button>
          </div>

          {showJobForm && (
            <div className="form-grid fade-up">
              <input
                className="form-input"
                name="title"
                placeholder="Job Title"
                value={jobForm.title}
                onChange={handleJobChange}
              />
              <input
                className="form-input"
                name="company_name"
                placeholder="Company Name"
                value={jobForm.company_name}
                onChange={handleJobChange}
              />
              <input
                className="form-input"
                name="location"
                placeholder="Location"
                value={jobForm.location}
                onChange={handleJobChange}
              />
              <select
                className="form-select"
                name="type"
                value={jobForm.type}
                onChange={handleJobChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
              </select>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Job Description"
                value={jobForm.description}
                onChange={handleJobChange}
              />
              <input
                className="form-input"
                name="url"
                placeholder="Apply Link (optional)"
                value={jobForm.url}
                onChange={handleJobChange}
              />
              <button
                className="btn btn-primary"
                onClick={handlePostJob}
                style={{ justifySelf: "start" }}
              >
                Post Job
              </button>
            </div>
          )}

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
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginBottom: "0.8rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {job.description}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        className="btn"
                        style={{ fontSize: "0.68rem", padding: "5px 10px" }}
                        onClick={() =>
                          navigate(`/job/view/${job.id}`, { state: { job } })
                        }
                      >
                        View
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: "0.68rem", padding: "5px 10px" }}
                        onClick={() =>
                          navigate(`/job/edit/${job.id}`, { state: { job } })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: "0.68rem", padding: "5px 10px" }}
                        onClick={() => deletePostedJob(job.id)}
                      >
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

        <div style={{ marginBottom: "1.5rem" }}>
          <p className="section-subtitle">Talent Pool</p>
          <h2 className="section-title">Browse Candidates</h2>
        </div>
        

        <div className="filter-bar">
          {/* 🔍 Search */}
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, skill, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 🎯 Role Filter */}
          <select
            className="filter-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {allRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* 🛂 Work Authorization Filter */}
          <select
            className="filter-select"
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value)}
          >
            <option value="All">All Work Status</option>
            <option value="US Citizen">US Citizen</option>
            <option value="Permanent Resident">Permanent Resident</option>
            <option value="F-1 Student">F-1 Student</option>
            <option value="No">No Sponsorship Needed</option>
            <option value="Yes">Needs Sponsorship</option>
            <option value="OPT Eligible">OPT Eligible</option>
            <option value="CPT Eligible">CPT Eligible</option>
          </select>      

          {/* 📊 Count (keep this LAST) */}
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-dim)",
              marginLeft: "auto",
            }}
          >
            {filteredCandidates.length} candidate
            {filteredCandidates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <p className="empty">No matching candidates found.</p>
        ) : (
          <div className="grid-candidates">
            {filteredCandidates.map((candidate, i) => {
              const profile = candidate.mainProfile;
              const otherResumeCount = candidate.otherProfiles?.length || 0;

              return (
                <div
                  key={candidate.id}
                  className="card fade-up"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    borderTop: compareList.find((c) => c.id === candidate.id)
                      ? "3px solid var(--accent)"
                      : "3px solid transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.8rem",
                    }}
                  >
                    <div>
                      <p className="candidate-name">{profile.name || "No Name"}</p>
                      <p className="candidate-role">{profile.role || "—"}</p>
                    </div>
                    <button
                      className={`btn-fav ${favorites.includes(candidate.id) ? "active" : ""
                        }`}
                      onClick={() => toggleFavorite(candidate.id)}
                    >
                      {favorites.includes(candidate.id) ? "💖" : "🤍"}
                    </button>
                  </div>

                  <p className="candidate-meta">✉ {candidate.email || "N/A"}</p>

                  {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                    <div style={{ margin: "0.8rem 0" }}>
                      {profile.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="tag">
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 5 && (
                        <span className="tag" style={{ opacity: 0.5 }}>
                          +{profile.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="candidate-actions">
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                      onClick={() =>
                        navigate(`/hr/view/${profile.id}`, {
                          state: {
                            user: profile,
                            candidateAccount: candidate,
                          },
                        })
                      }
                    >
                      View Profile
                    </button>

                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <button
                          className="btn"
                          style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                        >
                          GitHub ↗
                        </button>
                      </a>
                    )}
                  </div>

                  {otherResumeCount > 0 && (
                    <div style={{ marginTop: "0.7rem" }}>
                      <p
                        style={{
                          fontSize: "0.74rem",
                          color: "var(--text-muted)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        This candidate has {otherResumeCount} other resume
                        {otherResumeCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      marginTop: "0.8rem",
                      paddingTop: "0.8rem",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!compareList.find((c) => c.id === candidate.id)}
                      onChange={() => toggleCompare(candidate)}
                      disabled={
                        !compareList.find((c) => c.id === candidate.id) &&
                        compareList.length >= 4
                      }
                    />
                    {compareList.find((c) => c.id === candidate.id)
                      ? "Added to compare"
                      : "Add to compare"}
                  </label>

                  <div className="repo-section">
                    <p className="repo-label">GitHub Projects</p>
                    {loadingMap[candidate.id] ? (
                      <p
                        style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
                      >
                        Fetching repos...
                      </p>
                    ) : !repoMap[candidate.id] ||
                      repoMap[candidate.id].length === 0 ? (
                      <p
                        style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
                      >
                        No public repos found
                      </p>
                    ) : (
                      repoMap[candidate.id].map((repo) => (
                        <div key={repo.id} className="repo-item">
                          <p className="repo-name">{repo.name}</p>
                          <p className="repo-desc">
                            {repo.description || "No description"}
                          </p>
                          <button
                            className="btn"
                            style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/project/${repo.owner.login}/${repo.name}`,
                                {
                                  state: { repo },
                                }
                              );
                            }}
                          >
                            View Project
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {compareList.length >= 2 && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "var(--radius)",
            boxShadow: "0 8px 32px rgba(30, 58, 95, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "1.2rem",
            zIndex: 200,
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            whiteSpace: "nowrap",
          }}
        >
          <span>{compareList.length} candidates selected</span>
          <button
            style={{
              background: "#fff",
              color: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "6px 16px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.8rem",
              fontFamily: "var(--font-mono)",
            }}
            onClick={() =>
              navigate("/compare", { state: { selected: compareList } })
            }
          >
            Compare →
          </button>
          <button
            style={{
              background: "transparent",
              color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontFamily: "var(--font-mono)",
            }}
            onClick={() => setCompareList([])}
          >
            Clear
          </button>
        </div>
      )}

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