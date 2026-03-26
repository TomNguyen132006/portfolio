import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

function Profile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(location.state?.user || null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const current = JSON.parse(localStorage.getItem("currentUser"));

  // 🔥 fallback for refresh (use accounts instead of users)
  useEffect(() => {
    if (!user) {
      const saved = JSON.parse(localStorage.getItem("accounts")) || [];

      const found = saved
        .flatMap(acc => acc.profiles || [])
        .find(p => String(p.id) === String(id));

      setUser(found);
    }
  }, [id, user]);

  // 🔥 GitHub fetch
  useEffect(() => {
    if (user && user.github) {
      const username = user.github
        .replace("https://github.com/", "")
        .split("?")[0]
        .trim();

      fetch(`https://api.github.com/users/${username}/repos`)
        .then(res => res.json())
        .then(data => {
          const cleaned = data
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5);

          setRepos(cleaned);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  // 🔥 toggle public/private
  const togglePublic = () => {
    const current = JSON.parse(localStorage.getItem("currentUser"));

    const updatedProfiles = current.profiles.map(p =>
      p.id === user.id
        ? { ...p, isPublic: !p.isPublic }
        : p
    );

    current.profiles = updatedProfiles;

    // update localStorage
    localStorage.setItem("currentUser", JSON.stringify(current));

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const updatedAccounts = accounts.map(acc =>
      acc.email === current.email ? current : acc
    );

    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    // update UI instantly
    setUser(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1>{user.name}</h1>
      <p>{user.role}</p>
      <p>{user.skills?.join(", ")}</p>

      {/* 🔥 LinkedIn */}
      {user.linkedin && (
        <p>
          <a href={user.linkedin} target="_blank" rel="noreferrer">
            🔗 LinkedIn
          </a>
        </p>
      )}

      {/* 🔥 PUBLIC / PRIVATE BUTTON */}
      {current?.email === user.email && (
        <>
          <button onClick={togglePublic} style={{ marginBottom: "10px" }}>
            {user.isPublic ? "Make Private" : "Make Public"}
          </button>

          <p>
            Status:{" "}
            <strong style={{ color: user.isPublic ? "green" : "red" }}>
              {user.isPublic ? "Public" : "Private"}
            </strong>
          </p>
        </>
      )}

      <h2>GitHub Projects</h2>

      {loading ? (
        <p>Loading projects...</p>
      ) : repos.length === 0 ? (
        <p>No projects found</p>
      ) : (
        repos.map(repo => (
          <div key={repo.id} style={{ marginBottom: "10px" }}>
            <h3>{repo.name}</h3>
            <p>{repo.description}</p>
            <p>⭐ {repo.stargazers_count}</p>

            <a href={repo.html_url} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </div>
        ))
      )}
    </div>
  );
}

export default Profile;