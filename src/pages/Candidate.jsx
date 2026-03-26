import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Candidate() {
  const current = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [jobType, setJobType] = useState("All");
  const [loading, setLoading] = useState(true);

  // 🔥 fetch jobs from GitHub
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json")
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  // 🔥 filter jobs
  const filteredJobs = jobs.filter(job => {
    if (jobType === "All") return true;

    return job.title?.toLowerCase().includes(jobType.toLowerCase());
  });

  const addResume = () => {
    const current = JSON.parse(localStorage.getItem("currentUser"));

    const newProfile = {
      id: Date.now(),
      name: "New Resume",
      role: "",
      skills: [],
      github: "",
      linkedin: "",
      isPublic: false // 🔥 default private
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

    // refresh UI
    window.location.reload();
  };


  const deleteResume = (id) => {
    const current = JSON.parse(localStorage.getItem("currentUser"));

    // remove profile
    const updatedProfiles = current.profiles.filter(p => p.id !== id);

    current.profiles = updatedProfiles;

    // update currentUser
    localStorage.setItem("currentUser", JSON.stringify(current));

    // update accounts
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const updatedAccounts = accounts.map(acc =>
      acc.email === current.email ? current : acc
    );

    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    // update UI (no reload)
    window.location.reload();
  };

  const togglePublic = (id) => {
    const current = JSON.parse(localStorage.getItem("currentUser"));

    const updatedProfiles = current.profiles.map(p =>
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    );

    current.profiles = updatedProfiles;

    localStorage.setItem("currentUser", JSON.stringify(current));

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const updatedAccounts = accounts.map(acc =>
      acc.email === current.email ? current : acc
    );

    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    window.location.reload();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Profiles</h1>

      <button
        onClick={() => {
          localStorage.removeItem("currentUser");
          window.location.href = "/auth";
        }}
        style={{ marginBottom: "10px" }}
      >
        Logout
      </button>

      <button onClick={() => navigate("/candidate/new")}>
        + Add Resume
      </button>


      {/* 👤 PROFILES */}
      {current?.profiles?.map(profile => (
        <div
          key={profile.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <h3>{profile.name}</h3>
          <p>{profile.role}</p>
          <p>{profile.skills.join(", ")}</p>

          {/* 🔥 STATUS */}
          <p>
            Status:{" "}
            <strong style={{ color: profile.isPublic ? "green" : "red" }}>
              {profile.isPublic ? "Public" : "Private"}
            </strong>
          </p>

          {/* 🔥 TOGGLE */}
          <button onClick={() => togglePublic(profile.id)}>
            {profile.isPublic ? "Make Private" : "Make Public"}
          </button>

          {/* 🔥 DELETE */}
          <button
            onClick={() => deleteResume(profile.id)}
            style={{ marginLeft: "10px", color: "red" }}
          >
            Delete
          </button>

        </div>
      ))}

      {/* 💼 JOB SECTION */}
      <h2 style={{ marginTop: "30px" }}>Job Opportunities</h2>

      {/* 🎯 FILTER */}
      <select
        value={jobType}
        onChange={(e) => setJobType(e.target.value)}
      >
        <option value="All">All</option>
        <option value="Intern">Intern</option>
        <option value="Full">Full-time</option>
        <option value="Part">Part-time</option>
      </select>

      {/* 📄 JOB LIST */}
      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          filteredJobs.slice(0, 20).map((job, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px"
              }}
            >
              <h3>{job.company_name}</h3>
              <p>{job.title}</p>

              {job.location && <p>{job.location}</p>}

              {job.url && (
                <a href={job.url} target="_blank" rel="noreferrer">
                  Apply
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Candidate;