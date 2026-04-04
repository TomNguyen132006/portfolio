import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function HR() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [repoMap, setRepoMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [favorites, setFavorites] = useState([]);

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

    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");

    const candidateProfiles = accounts
      .filter((acc) => acc.role === "candidate")
      .flatMap((acc) => acc.profiles || []);

    setCandidates(candidateProfiles);
  }, [navigate]);

  useEffect(() => {
    const fetchRepos = async () => {
      const newRepoMap = {};

      for (const candidate of candidates) {
        if (!candidate.github) continue;

        let username = "";
        const githubValue = candidate.github.trim();

        const match = githubValue.match(/github\.com\/([^/?#]+)/i);
        if (match?.[1]) {
          username = match[1];
        } else {
          username = githubValue;
        }

        if (!username) continue;

        setLoadingMap((prev) => ({ ...prev, [candidate.id]: true }));

        try {
          const response = await fetch(
            `https://api.github.com/users/${username}/repos`
          );
          const repos = await response.json();

          if (Array.isArray(repos)) {
            newRepoMap[candidate.id] = repos
              .filter((repo) => !repo.fork)
              .slice(0, 3);
          } else {
            newRepoMap[candidate.id] = [];
          }
        } catch (error) {
          newRepoMap[candidate.id] = [];
        }

        setLoadingMap((prev) => ({ ...prev, [candidate.id]: false }));
      }

      setRepoMap(newRepoMap);
    };

    if (candidates.length > 0) {
      fetchRepos();
    }
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return candidates.filter((candidate) => {
      const name = (candidate.name || "").toLowerCase();
      const email = (candidate.email || "").toLowerCase();
      const role = (candidate.role || "").toLowerCase();
      const skills = Array.isArray(candidate.skills)
        ? candidate.skills.join(" ").toLowerCase()
        : "";

      const matchSearch =
        !keyword ||
        name.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword) ||
        skills.includes(keyword);

      const matchRole =
        selectedRole === "All" || candidate.role === selectedRole;

      return matchSearch && matchRole;
    });
  }, [candidates, search, selectedRole]);

  const allRoles = useMemo(() => {
    const roles = new Set();

    candidates.forEach((candidate) => {
      if (candidate.role) {
        roles.add(candidate.role);
      }
    });

    return ["All", ...Array.from(roles).sort()];
  }, [candidates]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/auth");
  };
  const toggleFavorite = (id) => {
    let updated;

    if (favorites.includes(id)) {
      updated = favorites.filter((f) => f !== id);
    } else {
      updated = [...favorites, id];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };
  return (
    <div style={{ padding: "20px" }}>
      <h1>HR Dashboard</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={() => navigate("/favorites")}>⭐ Favorites</button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ padding: "8px" }}
        >
          {allRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {filteredCandidates.length === 0 ? (
        <p>No matching candidates found.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "10px",
                background: "#fff",
              }}
            >
              <h3>{candidate.name || "No Name"}</h3>
              <p>
                <strong>Email:</strong> {candidate.email || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {candidate.role || "N/A"}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {Array.isArray(candidate.skills) && candidate.skills.length > 0
                  ? candidate.skills.join(", ")
                  : "N/A"}
              </p>

              {candidate.github && (
                <p>
                  <strong>GitHub:</strong>{" "}
                  <a href={candidate.github} target="_blank" rel="noreferrer">
                    Open GitHub
                  </a>
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() =>
                    navigate(`/hr/view/${candidate.id}`, {
                      state: { user: candidate },
                    })
                  }
                >
                  View Details
                </button>

                <button onClick={() => toggleFavorite(candidate.id)}>
                  {favorites.includes(candidate.id) ? "💖 Unfavorite" : "🤍 Favorite"}
                </button>
              </div>

              <div style={{ marginTop: "16px" }}>
                <h4>GitHub Projects</h4>

                {loadingMap[candidate.id] ? (
                  <p>Loading projects...</p>
                ) : !repoMap[candidate.id] || repoMap[candidate.id].length === 0 ? (
                  <p>No projects found</p>
                ) : (
                  repoMap[candidate.id].map((repo) => (
                    <div key={repo.id} style={{ marginBottom: "12px" }}>
                      <strong>{repo.name}</strong>
                      <p>{repo.description || "No description"}</p>
                      <a href={repo.html_url} target="_blank" rel="noreferrer">
                        View Project
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
  );
}

export default HR;