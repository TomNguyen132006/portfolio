import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function HR() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");

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
        (acc.profiles || []).filter(p => p.isPublic)
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

      return matchSearch && matchSkill;
    });
  }, [candidates, search, selectedSkill]);

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