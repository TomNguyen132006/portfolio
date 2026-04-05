import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function JobEdit() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const job = state?.job;

  const [form, setForm] = useState({
    title: job?.title || "",
    company_name: job?.company_name || "",
    location: job?.location || "",
    type: job?.type || "Full-time",
    description: job?.description || "",
    url: job?.url || "",
  });

  if (!job) return <p>Job not found</p>;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const jobs = JSON.parse(localStorage.getItem("postedJobs")) || [];

    const updatedJobs = jobs.map((j) =>
      j.id === job.id ? { ...j, ...form } : j
    );

    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));

    alert("Job updated!");
    navigate("/hr");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Job</h1>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
      />

      <input
        name="company_name"
        value={form.company_name}
        onChange={handleChange}
        placeholder="Company"
      />

      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        placeholder="Location"
      />

      <select name="type" value={form.type} onChange={handleChange}>
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Intern</option>
      </select>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
      />

      <input
        name="url"
        value={form.url}
        onChange={handleChange}
        placeholder="Apply URL"
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}

export default JobEdit;