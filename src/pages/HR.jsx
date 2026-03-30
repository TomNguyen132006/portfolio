import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function HR() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const [repoMap, setRepoMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("accounts")) || [];
    setAccounts(data);
  }, []);

  const candidates = useMemo(() => {
    return accounts.flatMap((acc) => acc.profiles || []);
  }, [accounts]);

  const allRoles = useMemo(() => {
    const roles = new Set();
    candidates.forEach((profile) => {
      if (profile.role) roles.add(profile.role);
    });
    return ["All", ...Array.from(roles)];
  }, [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter((profile) => {
      const matchSearch =
        profile.name?.toLowerCase().includes(search) ||
        profile.role?.toLowerCase().includes(search) ||
        profile.skills?.some((skill) =>
          skill.toLowerCase().includes(search)
        );

      const matchRole =
        selectedRole === "All" || profile.role === selectedRole;

      const matchFavorite =
        !showFavorites || favorites.includes(profile.id);

      return matchSearch && matchRole && matchFavorite;
    });
  }, [candidates, search, selectedRole, favorites, showFavorites]);

  useEffect(() => {
    const fetchRepos = async () => {
      const newRepoMap = {};

      for (const profile of candidates) {
        if (!profile.github) continue;

        const match = profile.github.match(/github\.com\/([^/?#]+)/i);
        const username = match?.[1];

        if (!username) continue;

        setLoadingMap((prev) => ({ ...prev, [profile.id]: true }));

        try {
          const res = await fetch(
            `https://api.github.com/users/${username}/repos`
          );
          const data = await res.json();

          if (Array.isArray(data)) {
            newRepoMap[profile.id] = data
              .filter((repo) => !repo.fork)
              .slice(0, 3);
          } else {
            newRepoMap[profile.id] = [];
          }
        } catch {
          newRepoMap[profile.id] = [];
        }

        setLoadingMap((prev) => ({ ...prev, [profile.id]: false }));
      }

      setRepoMap(newRepoMap);
    };

    if (candidates.length > 0) fetchRepos();
  }, [candidates]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>HR Dashboard</h1>

      <button
        onClick={() => {
          localStorage.removeItem("currentUser");
          window.location.href = "/auth";
        }}
      >
        Logout
      </button>

      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />

      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
      >
        {allRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      <div style={{ marginTop: "20px" }}>
        {filtered.map((profile) => (
          <div
            key={profile.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>{profile.name}</h3>
            <p>{profile.location}</p>
            <p>{profile.education}</p>
            <p>{profile.role}</p>

            <button
              onClick={() =>
                navigate(`/hr/view/${profile.id}`, { state: { user: profile } })
              }
            >
              View Detail
            </button>

            <h4>Projects</h4>

            {loadingMap[profile.id] ? (
              <p>Loading...</p>
            ) : !repoMap[profile.id] || repoMap[profile.id].length === 0 ? (
              <p>No projects</p>
            ) : (
              repoMap[profile.id].map((repo) => (
                <div key={repo.id} style={{ marginBottom: "12px" }}>
                  <strong>{repo.name}</strong>
                  <p>{repo.description}</p>

                  <button
                    onClick={() => window.open(repo.html_url, "_blank")}
                    style={{
                      background: "#24292f",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    🚀 View Project
                  </button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HR;