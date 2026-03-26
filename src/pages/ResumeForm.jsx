import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResumeForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    role: "",
    skills: "",
    github: "",
    linkedin: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const current = JSON.parse(localStorage.getItem("currentUser"));

    const newProfile = {
      id: Date.now(),
      name: form.name,
      role: form.role,
      skills: form.skills.split(",").map(s => s.trim()),
      github: form.github,
      linkedin: form.linkedin,
      isPublic: false
    };

    const updatedProfiles = [...(current.profiles || []), newProfile];
    current.profiles = updatedProfiles;

    // update localStorage
    localStorage.setItem("currentUser", JSON.stringify(current));

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const updatedAccounts = accounts.map(acc =>
      acc.id === current.id ? current : acc
    );

    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    // go back
    navigate("/candidate");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Resume</h1>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="role" placeholder="Role" onChange={handleChange} />
      <input name="skills" placeholder="Skills (React, Python)" onChange={handleChange} />
      <input name="github" placeholder="GitHub" onChange={handleChange} />
      <input name="linkedin" placeholder="LinkedIn" onChange={handleChange} />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}

export default ResumeForm;