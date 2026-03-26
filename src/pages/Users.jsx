import { useEffect, useMemo, useState } from "react";
import AddUser from "./AddUser";
import { Link } from "react-router-dom";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");

  useEffect(() => {
    const current = localStorage.getItem("currentUser");

    if (!current) {
      window.location.href = "/auth";
    }
  }, []);

  // ✅ LOAD ONLY (no saving here)
  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    setUsers(accounts);
  }, []);

  const allSkills = useMemo(() => {
    const skills = new Set();
    users.forEach(user => {
      user.skills.forEach(skill => skills.add(skill));
    });
    return ["All", ...skills];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch =
        user.name.toLowerCase().includes(search) ||
        user.skills.some(skill =>
          skill.toLowerCase().includes(search)
        );

      const matchFilter =
        selectedSkill === "All" ||
        user.skills.includes(selectedSkill);

      return matchSearch && matchFilter;
    });
  }, [users, search, selectedSkill]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Candidates</h1>

      <button
        onClick={() => {
          localStorage.removeItem("currentUser");
          window.location.href = "/auth";
        }}
        style={{ marginBottom: "10px" }}
      >
        Logout
      </button>

      <AddUser users={users} setUsers={setUsers} />

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />

      <select
        value={selectedSkill}
        onChange={(e) => setSelectedSkill(e.target.value)}
      >
        {allSkills.map(skill => (
          <option key={skill}>{skill}</option>
        ))}
      </select>

      <div style={{ marginTop: "20px" }}>
        {filteredUsers.length === 0 ? (
          <p>No candidates yet</p>
        ) : (
          filteredUsers.map(user => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              state={{ user }}
              style={{ textDecoration: "none", color: "white" }}
            >
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px"
                }}
              >
                <h3>{user.name}</h3>
                <p>{user.role}</p>
                <p>{user.skills.join(", ")}</p>

                {user.linkedin && (
                  <p>
                    <a href={user.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Users;