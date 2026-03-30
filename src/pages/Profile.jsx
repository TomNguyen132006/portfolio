import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

function ResumeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    role: "",
    category: "",
    location: "",
    education: "",
    summary: "",
    skills: "",
    certifications: "",
    licenses: "",
    linkedin: "",
    portfolio: "",
    github: ""
  });

  const formatUrl = (url) => {
    const trimmed = (url || "").trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    return "https://" + trimmed;
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toArray = (value) =>
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  useEffect(() => {
    if (!isEditMode) return;

    let profile = location.state?.user;

    if (!profile) {
      const current = JSON.parse(localStorage.getItem("currentUser"));
      profile = (current?.profiles || []).find(
        (p) => String(p.id) === String(id)
      );
    }

    if (profile) {
      setForm({
        name: profile.name || "",
        role: profile.role || "",
        category: profile.category || "",
        location: profile.location || "",
        education: profile.education || "",
        summary: profile.summary || "",
        skills: (profile.skills || []).join(", "),
        certifications: (profile.certifications || []).join(", "),
        licenses: (profile.licenses || []).join(", "),
        linkedin: profile.linkedin || "",
        portfolio: profile.portfolio || "",
        github: profile.github || ""
      });
    }
  }, [id, isEditMode, location.state]);

  const handleSave = () => {
    const current = JSON.parse(localStorage.getItem("currentUser"));

    if (!current) {
      alert("No current user found.");
      return;
    }

    if (!form.name.trim() || !form.role.trim()) {
      alert("Name and role are required.");
      return;
    }

    let updatedProfiles;

    if (isEditMode) {
      updatedProfiles = (current.profiles || []).map((profile) =>
        String(profile.id) === String(id)
          ? {
              ...profile,
              name: form.name.trim(),
              role: form.role.trim(),
              category: form.category.trim(),
              location: form.location.trim(),
              education: form.education.trim(),
              summary: form.summary.trim(),
              skills: toArray(form.skills),
              certifications: toArray(form.certifications),
              licenses: toArray(form.licenses),
              linkedin: formatUrl(form.linkedin),
              portfolio: formatUrl(form.portfolio),
              github: formatUrl(form.github)
            }
          : profile
      );
    } else {
      const newProfile = {
        id: Date.now(),
        email: current.email,
        name: form.name.trim(),
        role: form.role.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        education: form.education.trim(),
        summary: form.summary.trim(),
        skills: toArray(form.skills),
        certifications: toArray(form.certifications),
        licenses: toArray(form.licenses),
        linkedin: formatUrl(form.linkedin),
        portfolio: formatUrl(form.portfolio),
        github: formatUrl(form.github)
      };

      updatedProfiles = [...(current.profiles || []), newProfile];
    }

    const updatedCurrent = {
      ...current,
      profiles: updatedProfiles
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedCurrent));

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const updatedAccounts = accounts.map((acc) =>
      acc.id === updatedCurrent.id ? updatedCurrent : acc
    );

    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    if (isEditMode) {
      const updatedUser = updatedProfiles.find(
        (p) => String(p.id) === String(id)
      );

      navigate("/candidate");
    } else {
      navigate("/candidate");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>{isEditMode ? "Edit Profile" : "Create Profile"}</h1>

      <div style={{ display: "grid", gap: "12px" }}>
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        <input
          name="education"
          placeholder="Education"
          value={form.education}
          onChange={handleChange}
        />

        <textarea
          name="summary"
          placeholder="Professional summary"
          value={form.summary}
          onChange={handleChange}
          rows={4}
        />

        <input
          name="skills"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={handleChange}
        />

        <input
          name="certifications"
          placeholder="Certifications (comma separated)"
          value={form.certifications}
          onChange={handleChange}
        />

        <input
          name="licenses"
          placeholder="Licenses (comma separated)"
          value={form.licenses}
          onChange={handleChange}
        />

        <input
          name="linkedin"
          placeholder="LinkedIn URL"
          value={form.linkedin}
          onChange={handleChange}
        />

        <input
          name="portfolio"
          placeholder="Portfolio URL"
          value={form.portfolio}
          onChange={handleChange}
        />

        <input
          name="github"
          placeholder="GitHub URL"
          value={form.github}
          onChange={handleChange}
        />

        
      </div>

      <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
        <button onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}

export default ResumeForm;