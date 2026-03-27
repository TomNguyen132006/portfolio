import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Compare() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const selected = state?.selected || [];

  const [favorites, setFavorites] = useState([]);

  // load favorites
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  // toggle favorite
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

  // remove candidate from compare
  const [list, setList] = useState(selected);

  const removeCandidate = (id) => {
    setList(prev => prev.filter(p => p.id !== id));
  };

  // simple match score (based on shared skills)
  const getScore = (skills) => {
    const base = list[0]?.skills || [];
    const match = skills.filter(s => base.includes(s));
    return Math.round((match.length / base.length) * 100) || 0;
  };

  if (list.length < 2) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Select at least 2 candidates</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1>Compare Candidates</h1>

      {/* 🔥 RESPONSIVE GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginTop: "20px"
        }}
      >
        {list.map((user) => (
          <div
            key={user.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "10px",
              background: "#fff",
              position: "relative"
            }}
          >

            {/* ❌ REMOVE BUTTON */}
            <button
              onClick={() => removeCandidate(user.id)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                border: "none",
                background: "red",
                color: "white",
                cursor: "pointer",
                borderRadius: "5px",
                padding: "2px 6px"
              }}
            >
              ✕
            </button>

            {/* ⭐ FAVORITE */}
            <button
              onClick={() => toggleFavorite(user.id)}
              style={{
                color: favorites.includes(user.id) ? "gold" : "gray",
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer"
              }}
            >
              ★
            </button>

            <h3>{user.name}</h3>

            <p><strong>Role:</strong> {user.role}</p>

            <p><strong>Skills:</strong></p>
            <ul>
              {user.skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>

            {/* 🎯 MATCH SCORE */}
            <p>
              <strong>Match Score:</strong>{" "}
              <span style={{ color: "green" }}>
                {getScore(user.skills)}%
              </span>
            </p>

            {/* 🔗 LINKS */}
            {user.linkedin && (
              <p>
                <a href={user.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </p>
            )}

            {user.github && (
              <p>
                <a href={user.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Compare;