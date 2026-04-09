import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPopup from "./ChatPopup";
import "./Main.css";

function Candidate() {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const [postedJobs, setPostedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobType, setJobType] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchText, setSearchText] = useState("All");
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  const [repoMap, setRepoMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  const chatUsers = accounts.map((acc) => ({
    id: acc.id,
    name: acc.profiles?.[0]?.name?.trim() || acc.email || "No name",
    email: acc.email || "",
  }));

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!savedUser || savedUser.role !== "candidate") {
      navigate("/auth");
      return;
    }
    setCurrent(savedUser);
    setPostedJobs(JSON.parse(localStorage.getItem("postedJobs")) || []);
  }, [navigate]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json"
    )
      .then((res) => res.json())
      .then((data) => {
        setRecommendedJobs(Array.isArray(data) ? data : []);
        setLoadingRecommended(false);
      })
      .catch(() => setLoadingRecommended(false));
  }, []);

  useEffect(() => {
    const fetchRepos = async () => {
      const newRepoMap = {};

      for (const profile of current?.profiles || []) {
        if (!profile.github) continue;

        let username = "";
        const match = profile.github.trim().match(/github\.com\/([^/?#]+)/i);
        username = match?.[1] || profile.github.trim();

        if (!username) continue;

        setLoadingMap((prev) => ({ ...prev, [profile.id]: true }));

        try {
          const response = await fetch(
            `https://api.github.com/users/${username}/repos`
          );
          const repos = await response.json();

          newRepoMap[profile.id] = Array.isArray(repos)
            ? repos.filter((r) => !r.fork).slice(0, 3)
            : [];
        } catch {
          newRepoMap[profile.id] = [];
        }

        setLoadingMap((prev) => ({ ...prev, [profile.id]: false }));
      }

      setRepoMap(newRepoMap);
    };

    if (current?.profiles?.length > 0) {
      fetchRepos();
    }
  }, [current]);

  const deleteResume = (profileId) => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!savedUser) return;

    const updatedProfiles = (savedUser.profiles || []).filter(
      (p) => p.id !== profileId
    );
    const updatedUser = { ...savedUser, profiles: updatedProfiles };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    const updatedAccounts = accounts.map((acc) =>
      acc.id === updatedUser.id ? updatedUser : acc
    );
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    setCurrent(updatedUser);
  };

  const getJobType = (job = "") => {
    if (typeof job === "object" && job?.type) return job.type;
    const t = (typeof job === "string" ? job : job?.title || "").toLowerCase();
    if (t.includes("intern")) return "Intern";
    if (t.includes("part-time") || t.includes("part time")) return "Part-time";
    return "Full-time";
  };

  const getRole = (title = "") => {
    const t = title.toLowerCase();
    if (
      t.includes("software engineer") ||
      t.includes("software developer") ||
      t.includes("frontend") ||
      t.includes("backend") ||
      t.includes("full stack")
    )
      return "Software Developer";
    if (t.includes("data") || t.includes("analytics") || t.includes("analyst"))
      return "Data Analyst";
    if (
      t.includes("accounting") ||
      t.includes("accountant") ||
      t.includes("finance")
    )
      return "Accountant";
    if (t.includes("sales") || t.includes("business development"))
      return "Sales";
    if (t.includes("marketing")) return "Marketing";
    if (t.includes("product")) return "Product";
    if (t.includes("design") || t.includes("ui") || t.includes("ux"))
      return "Designer";
    if (t.includes("research")) return "Research";
    return "Other";
  };

  const allRoles = useMemo(() => {
    const roles = new Set();
    [...postedJobs, ...recommendedJobs].forEach((job) =>
      roles.add(getRole(job.title || ""))
    );
    return ["All", ...Array.from(roles).sort()];
  }, [postedJobs, recommendedJobs]);

  const candidateKeywords = useMemo(() => {
    const p = current?.profiles?.[0];
    if (!p) return [];
    return [p.role || "", ...(Array.isArray(p.skills) ? p.skills : [])]
      .map((s) => s.toLowerCase().trim())
      .filter(Boolean);
  }, [current]);

  const filterJobs = (jobs) => {
    const keyword = searchText.toLowerCase().trim();

    return jobs.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const company = (job.company_name || "").toLowerCase();
      const location =
        typeof job.location === "string" ? job.location.toLowerCase() : "";

      const matchSearch =
        !keyword ||
        keyword === "all" ||
        title.includes(keyword) ||
        company.includes(keyword) ||
        location.includes(keyword);

      const matchType = jobType === "All" || getJobType(job) === jobType;
      const matchRole =
        selectedRole === "All" || getRole(job.title || "") === selectedRole;

      return matchSearch && matchType && matchRole;
    });
  };

  const filteredPostedJobs = useMemo(
    () => filterJobs(postedJobs),
    [postedJobs, searchText, jobType, selectedRole]
  );

  const filteredRecommendedJobs = useMemo(() => {
    const base = filterJobs(recommendedJobs);

    if (candidateKeywords.length === 0) return base.slice(0, 20);

    return base
      .filter((job) => {
        const text = [
          job.title || "",
          job.company_name || "",
          typeof job.location === "string" ? job.location : "",
        ]
          .join(" ")
          .toLowerCase();

        return candidateKeywords.some((kw) => text.includes(kw));
      })
      .slice(0, 20);
  }, [
    recommendedJobs,
    searchText,
    jobType,
    selectedRole,
    candidateKeywords,
  ]);

  const searchGoogle = (job) => {
    const query = encodeURIComponent(
      `${job.company_name || ""} ${job.title || ""} official job`
    );
    window.open(
      `https://www.google.com/search?q=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openApply = (job) => {
    if (job.url?.trim())
      window.open(job.url, "_blank", "noopener,noreferrer");
    else searchGoogle(job);
  };

  const renderJobCard = (job, showSearch = false) => (
    <div
      key={job.id || job.url || `${job.company_name}-${job.title}`}
      className="card fade-up"
    >
      <p className="job-company">{job.company_name || "Unknown Company"}</p>
      <p className="job-title">{job.title || "No title"}</p>
      <p className="job-meta">
        {getJobType(job)} · {getRole(job.title || "")}
        {job.location
          ? ` · ${typeof job.location === "string"
            ? job.location
            : job.location?.name || ""
          }`
          : ""}
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

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: "0.7rem", padding: "6px 14px" }}
          onClick={() => openApply(job)}
        >
          Apply ↗
        </button>

        {showSearch && (
          <button
            className="btn"
            style={{ fontSize: "0.7rem", padding: "6px 14px" }}
            onClick={() => searchGoogle(job)}
          >
            Search
          </button>
        )}
      </div>
    </div>
  );

  const firstProfile = current?.profiles?.[0];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <span className="navbar-user">
            {firstProfile?.name || current?.email || "Candidate"}
          </span>
          <button className="btn" onClick={() => navigate("/candidate/new")}>
            + Add Profile
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
          <p className="section-subtitle">Candidate Dashboard</p>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            Welcome back
            {firstProfile?.name ? `, ${firstProfile.name.split(" ")[0]}` : ""}
          </h1>
        </div>

        <div
          style={{
            marginBottom: "0.8rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p className="section-subtitle">My Profiles</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Résumés
            </h2>
          </div>
        </div>

        {!current?.profiles?.length ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "2.5rem",
              marginBottom: "2rem",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              No profiles yet — add one to get started.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/candidate/new")}
            >
              + Create Profile
            </button>
          </div>
        ) : (
          <div className="grid-candidates" style={{ marginBottom: "2.5rem" }}>
            {current.profiles.map((profile, i) => (
              <div
                key={profile.id}
                className="card fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div style={{ marginBottom: "0.8rem" }}>
                  <p className="candidate-name">{profile.name || "No name"}</p>
                  <p className="candidate-role">{profile.role || "No role"}</p>
                </div>

                {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
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

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                  }}
                >
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <span className="tag" style={{ cursor: "pointer" }}>
                        GitHub ↗
                      </span>
                    </a>
                  )}

                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <span className="tag" style={{ cursor: "pointer" }}>
                        LinkedIn ↗
                      </span>
                    </a>
                  )}

                  
                </div>

    

                <div className="repo-section">
                  <p className="repo-label">GitHub Projects</p>
                  {loadingMap[profile.id] ? (
                    <p
                      style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
                    >
                      Fetching repos...
                    </p>
                  ) : !repoMap[profile.id] || repoMap[profile.id].length === 0 ? (
                    <p
                      style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
                    >
                      No public repos found
                    </p>
                  ) : (
                    repoMap[profile.id].map((repo) => (
                      <div key={repo.id} className="repo-item">
                        <p className="repo-name">{repo.name}</p>
                        <p className="repo-desc">
                          {repo.description || "No description"}
                        </p>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="repo-link"
                        >
                          View on GitHub ↗
                        </a>
                      </div>
                    ))
                  )}
                </div>

                <div className="candidate-actions">
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                    onClick={() =>
                      navigate(`/hr/view/${profile.id}`, {
                        state: { user: profile },
                      })
                    }
                  >
                    View Detail
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                    onClick={() =>
                      navigate(`/candidate/edit/${profile.id}`, {
                        state: { user: profile },
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                    onClick={() => deleteResume(profile.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="divider" />

        <div style={{ marginBottom: "1.5rem" }}>
          <p className="section-subtitle">Opportunities</p>
          <h2 className="section-title">Job Board</h2>
        </div>

        <div className="filter-bar">
          <input
            className="search-input"
            placeholder="Search jobs..."
            value={searchText === "All" ? "" : searchText}
            onChange={(e) => setSearchText(e.target.value || "All")}
          />
          <select
            className="filter-select"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Intern">Intern</option>
            <option value="Part-time">Part-time</option>
            <option value="Full-time">Full-time</option>
          </select>
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
        </div>

        <div style={{ marginBottom: "0.6rem" }}>
          <p className="section-subtitle">Posted by HR</p>
        </div>

        {filteredPostedJobs.length === 0 ? (
          <p className="empty">No HR-posted jobs yet.</p>
        ) : (
          <div className="grid-jobs" style={{ marginBottom: "2.5rem" }}>
            {filteredPostedJobs.map((job) => renderJobCard(job, false))}
          </div>
        )}

        <div className="divider" />

        <div
          style={{
            marginBottom: "0.6rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <p className="section-subtitle">Matched to your skills</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Job Opportunities
            </h2>
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
            If Apply link is outdated, use Search
          </p>
        </div>

        {loadingRecommended ? (
          <p className="empty">Loading opportunities...</p>
        ) : filteredRecommendedJobs.length === 0 ? (
          <p className="empty">No matching jobs found.</p>
        ) : (
          <div className="grid-jobs">
            {filteredRecommendedJobs.map((job) => renderJobCard(job, true))}
          </div>
        )}
      </div>

      <ChatPopup
        currentUser={{
          id: current?.id,
          name:
            current?.profiles?.[0]?.name?.trim() || current?.email || "No name",
        }}
        users={chatUsers}
      />
    </div>
  );
}

export default Candidate;