import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // load favorites
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  // load accounts
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("accounts")) || [];
    setAccounts(data);
  }, []);

  // 🔥 get favorite profiles
  const favoriteProfiles = accounts
    .flatMap(acc => acc.profiles || [])
    .filter(profile => favorites.includes(profile.id));

  return (
    <div style={{ padding: "20px" }}>
      <h1>⭐ Favorite Candidates</h1>

      <button onClick={() => window.location.href = "/hr"}>
        ← Back to HR
      </button>

      <div style={{ marginTop: "20px" }}>
        {favoriteProfiles.length === 0 ? (
          <p>No favorites yet</p>
        ) : (
          favoriteProfiles.map(profile => (
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
                  marginBottom: "10px"
                }}
              >
                <h3>{profile.name}</h3>
                <p>{profile.role}</p>
                <p>{profile.skills?.join(", ")}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Favorites;