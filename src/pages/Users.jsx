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
      return;
    }
  }, []);

  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    // only keep candidate users
    const candidatesOnly = accounts.filter(
      (user) => user.role === "candidate"
    );

    setUsers(candidatesOnly);
  }, []);

  const allSkills = useMemo(() => {
    const skills = new Set();

    users.forEach((user) => {
      (user.skills || []).forEach((skill) => skills.add(skill));
    });

    return ["All", ...skills];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const role = (user.role || "").toLowerCase();
      const skills = user.skills || [];

      const matchSearch =
        name.includes(search) ||
        role.includes(search) ||
        skills.some((skill) => skill.toLowerCase().includes(search));

      const matchFilter =
        selectedSkill === "All" || skills.includes(selectedSkill);

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

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          style={{ marginRight: "10px", padding: "8px" }}
        />

        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          style={{ padding: "8px" }}
        >
          {allSkills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "20px" }}>
        {filteredUsers.length === 0 ? (
          <p>No candidates yet</p>
        ) : (
          filteredUsers.map((user) => (
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
                  marginBottom: "10px",
                }}
              >
                <h3>{user.name || "No name"}</h3>
                <p>{user.role || "No role"}</p>
                <p>{(user.skills || []).join(", ") || "No skills listed"}</p>

                {user.linkedin && (
                  <p>
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
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