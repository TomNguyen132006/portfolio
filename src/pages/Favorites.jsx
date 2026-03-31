import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [repoMap, setRepoMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);

    const data = JSON.parse(localStorage.getItem("accounts")) || [];
    setAccounts(data);
  }, []);

  const favoriteProfiles = useMemo(() => {
    return accounts
      .filter((acc) => acc.role === "candidate")
      .flatMap((acc) => acc.profiles || [])
      .filter((profile) => favorites.includes(profile.id));
  }, [accounts, favorites]);

  const toggleFavorite = (profileId) => {
    const updatedFavorites = favorites.filter((id) => id !== profileId);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
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
          const response = await fetch(
            `https://api.github.com/users/${username}/repos`
          );
          const repos = await response.json();

          if (Array.isArray(repos)) {
            newRepoMap[profile.id] = repos
              .filter((repo) => !repo.fork)
              .slice(0, 3);
          } else {
            newRepoMap[profile.id] = [];
          }
        } catch (error) {
          newRepoMap[profile.id] = [];
        }

        setLoadingMap((prev) => ({ ...prev, [profile.id]: false }));
      }

      setRepoMap(newRepoMap);
    };

    if (favoriteProfiles.length > 0) {
      fetchRepos();
    }
  }, [favoriteProfiles]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>⭐ Favorite Candidates</h1>

      <button
        onClick={() => navigate("/hr")}
        style={{ marginBottom: "20px" }}
      >
        ← Back to HR
      </button>

      <div style={{ marginTop: "20px" }}>
        {favoriteProfiles.length === 0 ? (
          <p>No favorites yet</p>
        ) : (
          favoriteProfiles.map((profile) => (
            <div
              key={profile.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>{profile.name || "No name"}</h3>
              <p>{profile.role || "No role"}</p>
              <p>{(profile.skills || []).join(", ") || "No skills listed"}</p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "15px",
                }}
              >
                <button
                  onClick={() =>
                    navigate(`/hr/view/${profile.id}`, {
                      state: { user: profile },
                    })
                  }
                >
                  View Detail
                </button>

                <button onClick={() => toggleFavorite(profile.id)}>
                  💔 Remove Favorite
                </button>

                {profile.linkedin && (
                  <button
                    onClick={() => window.open(profile.linkedin, "_blank")}
                  >
                    LinkedIn
                  </button>
                )}

                {profile.github && (
                  <button
                    onClick={() => window.open(profile.github, "_blank")}
                  >
                    GitHub
                  </button>
                )}
              </div>

              <h4>Projects</h4>

              {loadingMap[profile.id] ? (
                <p>Loading...</p>
              ) : !repoMap[profile.id] || repoMap[profile.id].length === 0 ? (
                <p>No projects</p>
              ) : (
                repoMap[profile.id].map((repo) => (
                  <div key={repo.id} style={{ marginBottom: "12px" }}>
                    <strong>{repo.name}</strong>
                    <p>{repo.description || "No description"}</p>

                    <button onClick={() => window.open(repo.html_url, "_blank")}>
                      🚀 View Project
                    </button>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Favorites;