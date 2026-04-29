// src/pages/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddUser from "./AddUser";
import "./Main.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [showAddUser, setShowAddUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("currentUser")) {
      navigate("/auth");
      return;
    }
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    setUsers(accounts.filter((u) => u.role === "candidate"));
  }, [navigate]);

  const allSkills = useMemo(() => {
    const skills = new Set();
    users.forEach((u) => (u.skills || []).forEach((s) => skills.add(s)));
    return ["All", ...Array.from(skills).sort()];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const role = (user.role || "").toLowerCase();
      const skills = user.skills || [];
      const keyword = search.toLowerCase();
      const matchSearch =
        name.includes(keyword) ||
        role.includes(keyword) ||
        skills.some((s) => s.toLowerCase().includes(keyword));
      const matchSkill =
        selectedSkill === "All" || skills.includes(selectedSkill);
      return matchSearch && matchSkill;
    });
  }, [users, search, selectedSkill]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <button
            className="btn"
            onClick={() => setShowAddUser((v) => !v)}
          >
            {showAddUser ? "− Collapse" : "+ Add User"}
          </button>
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem("currentUser");
              navigate("/auth");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="page">

        <div style={{ marginBottom: "2.5rem" }}>
          <p className="section-subtitle">Admin</p>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Candidates
          </h1>
          {users.length > 0 && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
              {users.length} candidate{users.length !== 1 ? "s" : ""} registered
            </p>
          )}
        </div>

        {showAddUser && (
          <div className="fade-up" style={{ marginBottom: "2rem" }}>
            <AddUser users={users} setUsers={setUsers} />
          </div>
        )}

        <div className="filter-bar">
          <input
            className="search-input"
            placeholder="Search by name, role, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginLeft: "auto" }}>
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── User cards ── */}
        {filteredUsers.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              No candidates found.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddUser(true)}
            >
              + Add First User
            </button>
          </div>
        ) : (
          <div className="grid-candidates">
            {filteredUsers.map((user, i) => (
              <Link
                key={user.id}
                to={`/users/${user.id}`}
                state={{ user }}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card fade-up"
                  style={{ animationDelay: `${i * 0.05}s`, cursor: "pointer" }}
                >
                  <div style={{ marginBottom: "0.8rem" }}>
                    <p className="candidate-name">{user.name || "No Name"}</p>
                    <p className="candidate-role">{user.role || "—"}</p>
                  </div>

                  {(user.skills || []).length > 0 ? (
                    <div style={{ marginBottom: "1rem" }}>
                      {user.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="tag">{skill}</span>
                      ))}
                      {user.skills.length > 5 && (
                        <span className="tag" style={{ opacity: 0.5 }}>
                          +{user.skills.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "1rem" }}>
                      No skills listed
                    </p>
                  )}

                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="btn" style={{ fontSize: "0.7rem", padding: "5px 12px" }}>
                        LinkedIn ↗
                      </button>
                    </a>
                  )}

                  <div style={{
                    marginTop: "1rem", paddingTop: "0.8rem",
                    borderTop: "1px solid var(--border)",
                    fontSize: "0.72rem", color: "var(--text-dim)",
                    letterSpacing: "0.04em",
                  }}>
                    Click to view profile →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;