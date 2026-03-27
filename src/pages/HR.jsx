import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function HR() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  // load accounts
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("accounts")) || [];
    setAccounts(data);
  }, []);

  // 🔥 get all candidate profiles
  const candidates = useMemo(() => {
    return accounts
      .filter(acc => acc.profiles && acc.profiles.length > 0)
      .flatMap(acc =>
        (acc.profiles || [])
      );
  }, [accounts]);
  // 🔥 extract all skills (for dropdown)
  const allSkills = useMemo(() => {
    const skills = new Set();

    candidates.forEach(profile => {
      profile.skills?.forEach(skill => skills.add(skill));
    });

    return ["All", ...skills];
  }, [candidates]);

  // 🔥 filter logic (search + dropdown)
  const filtered = useMemo(() => {
    return candidates.filter(profile => {
      const matchSearch =
        profile.name?.toLowerCase().includes(search) ||
        profile.skills?.some(skill =>
          skill.toLowerCase().includes(search)
        );

      const matchSkill =
        selectedSkill === "All" ||
        profile.skills?.includes(selectedSkill);

      const matchFavorite =
        !showFavorites || favorites.includes(profile.id);

      return matchSearch && matchSkill && matchFavorite;
    });
  }, [candidates, search, selectedSkill, favorites, showFavorites]);

  const toggleFavorite = (id) => {
    let updated;

    if (favorites.includes(id)) {
      updated = favorites.filter(f => f !== id);
    } else {
      updated = [...favorites, id];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>HR Dashboard</h1>

      <button
        onClick={() => {
          localStorage.removeItem("currentUser");
          window.location.href = "/auth";
        }}
        style={{ marginBottom: "10px" }}
      >
        Logout
      </button>

      <button onClick={() => window.location.href = "/favorites"}>
        ⭐ View Favorites
      </button>


      {/* 🔍 Search */}
      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
        style={{ marginRight: "10px" }}
      />

      {/* 🎯 Skill Filter */}
      <select
        value={selectedSkill}
        onChange={(e) => setSelectedSkill(e.target.value)}
      >
        {allSkills.map(skill => (
          <option key={skill}>{skill}</option>
        ))}
      </select>
      <button
        onClick={() => navigate("/compare", { state: { selected } })}
        disabled={selected.length < 2}
        style={{
          marginBottom: "10px",
          background: selected.length < 2 ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          padding: "8px 12px",
          cursor: selected.length < 2 ? "not-allowed" : "pointer"
        }}
      >
        Compare ({selected.length})
      </button>

      {/* 👤 Candidate List */}
      <div style={{ marginTop: "20px" }}>
        {filtered.length === 0 ? (
          <p>No candidates found</p>
        ) : (
          filtered.map(profile => (
            <Link
              key={profile.id}
              to={`/users/${profile.id}`}
              state={{ user: profile }}
              style={{ textDecoration: "none", color: "white" }}
            >
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px",
                  cursor: "pointer"
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault(); // stop navigation
                    toggleFavorite(profile.id);
                  }}
                  style={{
                    color: favorites.includes(profile.id) ? "gold" : "gray",
                    marginBottom: "5px",
                    border: "none",
                    background: "transparent",
                    fontSize: "18px",
                    cursor: "pointer"
                  }}
                >
                  ★
                </button>

                <input
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  checked={selected.some(p => p.id === profile.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected(prev => [...prev, profile]);
                    } else {
                      setSelected(prev => prev.filter(p => p.id !== profile.id));
                    }
                  }}
                />
                <h3>{profile.name}</h3>
                <p>{profile.role}</p>
                <p>{profile.skills?.join(", ")}</p>

                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} // 🔥 prevent conflict
                  >
                    LinkedIn
                  </a>

                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default HR;