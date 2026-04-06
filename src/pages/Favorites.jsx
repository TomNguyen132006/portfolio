// src/pages/Favorites.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [repoMap, setRepoMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem("favorites")) || []);
    setAccounts(JSON.parse(localStorage.getItem("accounts")) || []);
  }, []);

  const favoriteProfiles = useMemo(() => {
    return accounts
      .filter((acc) => acc.role === "candidate")
      .flatMap((acc) => acc.profiles || [])
      .filter((profile) => favorites.includes(profile.id));
  }, [accounts, favorites]);

  const toggleFavorite = (profileId) => {
    const updated = favorites.filter((id) => id !== profileId);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchRepos = async () => {
      const newRepoMap = {};
      for (const profile of favoriteProfiles) {
        if (!profile.github) continue;
        const match = profile.github.match(/github\.com\/([^/?#]+)/i);
        const username = match?.[1];
        if (!username) continue;
        setLoadingMap((prev) => ({ ...prev, [profile.id]: true }));
        try {
          const res = await fetch(`https://api.github.com/users/${username}/repos`);
          const repos = await res.json();
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
    if (favoriteProfiles.length > 0) fetchRepos();
  }, [favoriteProfiles]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <button className="btn" onClick={() => navigate("/hr")}>
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="page">

        {/* ── Header ── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="section-subtitle">HR Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Saved Candidates
          </h1>
          {favoriteProfiles.length > 0 && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
              {favoriteProfiles.length} candidate{favoriteProfiles.length !== 1 ? "s" : ""} saved
            </p>
          )}
        </div>

        {/* ── Empty state ── */}
        {favoriteProfiles.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>⭐</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.2rem" }}>
              No saved candidates yet. Go back to the dashboard and star candidates you like.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/hr")}>
              Browse Candidates
            </button>
          </div>
        ) : (
          <div className="grid-candidates">
            {favoriteProfiles.map((profile, i) => (
              <div
                key={profile.id}
                className="card fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* ── Card header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                  <div>
                    <p className="candidate-name">{profile.name || "No Name"}</p>
                    <p className="candidate-role">{profile.role || "—"}</p>
                  </div>
                  <button
                    className="btn-fav active"
                    onClick={() => toggleFavorite(profile.id)}
                    title="Remove from favorites"
                  >
                    💖
                  </button>
                </div>

                {/* ── Skills ── */}
                {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    {profile.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="tag">{skill}</span>
                    ))}
                    {profile.skills.length > 5 && (
                      <span className="tag" style={{ opacity: 0.5 }}>
                        +{profile.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="candidate-actions">
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                    onClick={() => navigate(`/hr/view/${profile.id}`, { state: { user: profile } })}
                  >
                    View Profile
                  </button>
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <button className="btn" style={{ fontSize: "0.7rem", padding: "6px 14px" }}>
                        GitHub ↗
                      </button>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <button className="btn" style={{ fontSize: "0.7rem", padding: "6px 14px" }}>
                        LinkedIn ↗
                      </button>
                    </a>
                  )}
                </div>

                {/* ── GitHub Repos ── */}
                <div className="repo-section">
                  <p className="repo-label">GitHub Projects</p>
                  {loadingMap[profile.id] ? (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Fetching repos...</p>
                  ) : !repoMap[profile.id] || repoMap[profile.id].length === 0 ? (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>No public repos found</p>
                  ) : (
                    repoMap[profile.id].map((repo) => (
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
    </div>
  );
}

export default Favorites;