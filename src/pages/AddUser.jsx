import { useState } from "react";

function AddUser({ users, setUsers }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanGithub = github
      .replace("https://github.com/", "")
      .split("?")[0]
      .trim();

    const cleanLinkedin = linkedin.startsWith("http")
      ? linkedin
      : "https://" + linkedin;

    const newUser = {
      id: Date.now(),
      name,
      role,
      github: cleanGithub,
      linkedin: cleanLinkedin,
      skills: skills.split(",").map(s => s.trim())
    };

    const updatedUsers = [...users, newUser];

    setUsers(updatedUsers);

    // ✅ SAVE HERE ONLY (no useEffect loop)
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setName("");
    setRole("");
    setSkills("");
    setGithub("");
    setLinkedin("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <input
        placeholder="Skills (React, Python)"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />
      <input
        placeholder="GitHub username"
        value={github}
        onChange={(e) => setGithub(e.target.value)}
      />
      <input
        placeholder="LinkedIn URL"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default AddUser;