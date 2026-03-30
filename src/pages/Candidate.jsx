import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Candidate() {
  const current = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [jobType, setJobType] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  const getJobType = (title = "") => {
    const t = title.toLowerCase();

    if (t.includes("intern")) return "Intern";
    if (t.includes("part-time") || t.includes("part time")) return "Part-time";
    return "Full-time";
  };

  const getRole = (title = "") => {
    const t = title.toLowerCase();

    if (
      t.includes("software engineer") ||
      t.includes("software developer") ||
      t.includes(".net") ||
      t.includes("frontend") ||
      t.includes("backend") ||
      t.includes("full stack")
    ) return "Software Developer";

    if (t.includes("data") || t.includes("analytics") || t.includes("analyst")) {
      return "Data Analyst";
    }

    if (t.includes("accounting") || t.includes("accountant") || t.includes("finance")) {
      return "Accountant";
    }

    if (t.includes("sales") || t.includes("business development")) {
      return "Sales";
    }

    if (t.includes("marketing")) {
      return "Marketing";
    }

    if (t.includes("product")) {
      return "Product";
    }

    if (t.includes("design") || t.includes("ui") || t.includes("ux")) {
      return "Designer";
    }

    if (t.includes("research")) {
      return "Research";
    }

    return "Other";
  };

  const allRoles = useMemo(() => {
    const roles = new Set();

    jobs.forEach((job) => {
      roles.add(getRole(job.title));
    });

    return ["All", ...Array.from(roles).sort()];
  }, [jobs]);

  const filteredJobs = jobs.filter((job) => {
    const type = getJobType(job.title);
    const role = getRole(job.title);

    const matchType = jobType === "All" || type === jobType;
    const matchRole = selectedRole === "All" || role === selectedRole;

    return matchType && matchRole;
  });

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

      {current?.profiles?.length > 0 ? (
        current.profiles.map((profile) => (
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
            <p>{profile.skills?.join(", ")}</p>

            <button
              onClick={() =>
                navigate(`/hr/view/${profile.id}`, { state: { user: profile } })
              }
            >
              View Detail
            </button>

            <button
              onClick={() =>
                navigate(`/candidate/edit/${profile.id}`, { state: { user: profile } })
              }
              style={{ marginLeft: "10px" }}
            >
              Edit
            </button>

            <button
              onClick={() => deleteResume(profile.id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>No profiles yet</p>
      )}





      <h2 style={{ marginTop: "30px" }}>Job Opportunities</h2>

      <select
        value={jobType}
        onChange={(e) => setJobType(e.target.value)}
      >
        <option value="All">All Types</option>
        <option value="Intern">Intern</option>
        <option value="Part-time">Part-time</option>
        <option value="Full-time">Full-time</option>
      </select>

      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        style={{ marginLeft: "10px" }}
      >
        {allRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

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
              <p>{getJobType(job.title)} | {getRole(job.title)}</p>

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