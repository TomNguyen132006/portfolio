import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPopup from "./ChatPopup";

function HR() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [repoMap, setRepoMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [current, setCurrent] = useState(null);

  const [postedJobs, setPostedJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    company_name: "",
    location: "",
    type: "Full-time",
    description: "",
    url: "",
  });



  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);

    const savedJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    setPostedJobs(savedJobs);
  }, []);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "hr") {
      navigate("/auth");
      return;
    }

    setCurrent(currentUser);

    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");

    const candidateProfiles = accounts
      .filter((acc) => acc.role === "candidate")
      .flatMap((acc) => acc.profiles || []);

    setCandidates(candidateProfiles);
  }, [navigate]);

  const chatUsers = useMemo(() => {
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    return accounts.map((acc) => ({
      id: acc.id,
      name: acc.profiles?.[0]?.name || acc.email || "No name",
      email: acc.email || "",
    }));
  }, []);

  useEffect(() => {
    const fetchRepos = async () => {
      const newRepoMap = {};

      for (const candidate of candidates) {
        if (!candidate.github) continue;

        let username = "";
        const githubValue = candidate.github.trim();

        const match = githubValue.match(/github\.com\/([^/?#]+)/i);
        if (match?.[1]) {
          username = match[1];
        } else {
          username = githubValue;
        }

        if (!username) continue;

        setLoadingMap((prev) => ({ ...prev, [candidate.id]: true }));

        try {
          const response = await fetch(
            `https://api.github.com/users/${username}/repos`
          );
          const repos = await response.json();

          if (Array.isArray(repos)) {
            newRepoMap[candidate.id] = repos
              .filter((repo) => !repo.fork)
              .slice(0, 3);
          } else {
            newRepoMap[candidate.id] = [];
          }
        } catch (error) {
          newRepoMap[candidate.id] = [];
        }

        setLoadingMap((prev) => ({ ...prev, [candidate.id]: false }));
      }

      setRepoMap(newRepoMap);
    };

    if (candidates.length > 0) {
      fetchRepos();
    }
  }, [candidates]);



  const filteredCandidates = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return candidates.filter((candidate) => {
      const name = (candidate.name || "").toLowerCase();
      const email = (candidate.email || "").toLowerCase();
      const role = (candidate.role || "").toLowerCase();
      const skills = Array.isArray(candidate.skills)
        ? candidate.skills.join(" ").toLowerCase()
        : "";

      const matchSearch =
        !keyword ||
        name.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword) ||
        skills.includes(keyword);

      const matchRole =
        selectedRole === "All" || candidate.role === selectedRole;

      return matchSearch && matchRole;
    });
  }, [candidates, search, selectedRole]);

  const allRoles = useMemo(() => {
    const roles = new Set();

    candidates.forEach((candidate) => {
      if (candidate.role) {
        roles.add(candidate.role);
      }
    });

    return ["All", ...Array.from(roles).sort()];
  }, [candidates]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/auth");
  };

  const toggleFavorite = (id) => {
    let updated;

    if (favorites.includes(id)) {
      updated = favorites.filter((f) => f !== id);
    } else {
      updated = [...favorites, id];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleJobChange = (e) => {
    setJobForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePostJob = () => {
    if (!jobForm.title.trim() || !jobForm.company_name.trim()) {
      alert("Job title and company are required.");
      return;
    }

    const newJob = {
      id: Date.now(),
      title: jobForm.title.trim(),
      company_name: jobForm.company_name.trim(),
      location: jobForm.location.trim(),
      type: jobForm.type,
      description: jobForm.description.trim(),
      url: jobForm.url.trim(),
      source: "HR Posting",
      createdAt: new Date().toISOString(),
    };

    const updatedJobs = [newJob, ...postedJobs];
    setPostedJobs(updatedJobs);
    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));

    setJobForm({
      title: "",
      company_name: "",
      location: "",
      type: "Full-time",
      description: "",
      url: "",
    });
  };

  const deletePostedJob = (jobId) => {
    const updatedJobs = postedJobs.filter((job) => job.id !== jobId);
    setPostedJobs(updatedJobs);
    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>HR Dashboard</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={() => navigate("/favorites")}>⭐ Favorites</button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "16px",
          borderRadius: "10px",
          marginBottom: "24px",
          background: "#fff",
        }}
      >
        <h2>Post a Job</h2>

        <div style={{ display: "grid", gap: "10px", maxWidth: "700px" }}>
          <input
            name="title"
            placeholder="Job Title"
            value={jobForm.title}
            onChange={handleJobChange}
          />

          <input
            name="company_name"
            placeholder="Company Name"
            value={jobForm.company_name}
            onChange={handleJobChange}
          />

          <input
            name="location"
            placeholder="Location"
            value={jobForm.location}
            onChange={handleJobChange}
          />

          <select
            name="type"
            value={jobForm.type}
            onChange={handleJobChange}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Intern">Intern</option>
          </select>

          <textarea
            name="description"
            placeholder="Job Description"
            value={jobForm.description}
            onChange={handleJobChange}
            rows={4}
          />

          <input
            name="url"
            placeholder="Apply Link (optional)"
            value={jobForm.url}
            onChange={handleJobChange}
          />

          <button onClick={handlePostJob}>Post Job</button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>My Posted Jobs</h3>

          {postedJobs.length === 0 ? (
            <p>No jobs posted yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {postedJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                >
                  <h4>{job.title}</h4>
                  <p>
                    <strong>Company:</strong> {job.company_name}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location || "N/A"}
                  </p>
                  <p>
                    <strong>Type:</strong> {job.type}
                  </p>
                  {job.description && <p>{job.description}</p>}

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={() => deletePostedJob(job.id)}>
                      Delete Job
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/job/view/${job.id}`, { state: { job } })
                      }
                    >
                      View Detail
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/job/edit/${job.id}`, { state: { job } })
                      }
                    >
                      Edit
                    </button>


                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ padding: "8px" }}
        >
          {allRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {filteredCandidates.length === 0 ? (
        <p>No matching candidates found.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "10px",
                background: "#fff",
              }}
            >
              <h3>{candidate.name || "No Name"}</h3>
              <p>
                <strong>Email:</strong> {candidate.email || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {candidate.role || "N/A"}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {Array.isArray(candidate.skills) && candidate.skills.length > 0
                  ? candidate.skills.join(", ")
                  : "N/A"}
              </p>

              {candidate.github && (
                <p>
                  <strong>GitHub:</strong>{" "}
                  <a href={candidate.github} target="_blank" rel="noreferrer">
                    Open GitHub
                  </a>
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() =>
                    navigate(`/hr/view/${candidate.id}`, {
                      state: { user: candidate },
                    })
                  }
                >
                  View Details
                </button>

                <button onClick={() => toggleFavorite(candidate.id)}>
                  {favorites.includes(candidate.id) ? "💖 Unfavorite" : "🤍 Favorite"}
                </button>
              </div>

              <div style={{ marginTop: "16px" }}>
                <h4>GitHub Projects</h4>

                {loadingMap[candidate.id] ? (
                  <p>Loading projects...</p>
                ) : !repoMap[candidate.id] || repoMap[candidate.id].length === 0 ? (
                  <p>No projects found</p>
                ) : (
                  repoMap[candidate.id].map((repo) => (
                    <div key={repo.id} style={{ marginBottom: "12px" }}>
                      <strong>{repo.name}</strong>
                      <p>{repo.description || "No description"}</p>
                      <a href={repo.html_url} target="_blank" rel="noreferrer">
                        View Project
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ChatPopup
        currentUser={{
          id: current?.id,
          name: current?.profiles?.[0]?.name?.trim() || current?.email || "No name",
        }}
        users={chatUsers}
      />
    </div>
  );
}



export default HR;