import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPopup from "./ChatPopup";
import "./Main.css";
function Candidate() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

  const [postedJobs, setPostedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobType, setJobType] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  const chatUsers = accounts.map((acc) => {
  const name = acc.profiles?.[0]?.name?.trim();

  return {
    id: acc.id,
    name: name || acc.email || "No name",
    email: acc.email || "",
  };
});

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!savedUser || savedUser.role !== "candidate") {
      navigate("/auth");
      return;
    }

    setCurrent(savedUser);

    const savedPostedJobs =
      JSON.parse(localStorage.getItem("postedJobs")) || [];
    setPostedJobs(savedPostedJobs);
  }, [navigate]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json"
    )
      .then((res) => res.json())
      .then((data) => {
        setRecommendedJobs(Array.isArray(data) ? data : []);
        setLoadingRecommended(false);
      })
      .catch((err) => {
        console.error("Error fetching recommended jobs:", err);
        setLoadingRecommended(false);
      });
  }, []);

  const deleteResume = (profileId) => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!savedUser) return;

    const updatedProfiles = (savedUser.profiles || []).filter(
      (profile) => profile.id !== profileId
    );

    const updatedCurrentUser = {
      ...savedUser,
      profiles: updatedProfiles,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const updatedAccounts = accounts.map((acc) =>
      acc.id === updatedCurrentUser.id ? updatedCurrentUser : acc
    );

    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
    setCurrent(updatedCurrentUser);
  };

  const getJobType = (jobOrTitle = "") => {
    if (typeof jobOrTitle === "object" && jobOrTitle?.type) {
      return jobOrTitle.type;
    }

    const title =
      typeof jobOrTitle === "string" ? jobOrTitle : jobOrTitle?.title || "";
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
    ) {
      return "Software Developer";
    }

    if (
      t.includes("data") ||
      t.includes("analytics") ||
      t.includes("analyst")
    ) {
      return "Data Analyst";
    }

    if (
      t.includes("accounting") ||
      t.includes("accountant") ||
      t.includes("finance")
    ) {
      return "Accountant";
    }

    if (t.includes("sales") || t.includes("business development")) {
      return "Sales";
    }

    if (t.includes("marketing")) return "Marketing";
    if (t.includes("product")) return "Product";
    if (t.includes("design") || t.includes("ui") || t.includes("ux")) {
      return "Designer";
    }
    if (t.includes("research")) return "Research";

    return "Other";
  };

  const allRoles = useMemo(() => {
    const roles = new Set();

    [...postedJobs, ...recommendedJobs].forEach((job) => {
      roles.add(getRole(job.title || ""));
    });

    return ["All", ...Array.from(roles).sort()];
  }, [postedJobs, recommendedJobs]);

  const candidateKeywords = useMemo(() => {
    const firstProfile = current?.profiles?.[0];

    if (!firstProfile) return [];

    return [
      firstProfile.role || "",
      ...(Array.isArray(firstProfile.skills) ? firstProfile.skills : []),
    ]
      .map((item) => item.toLowerCase().trim())
      .filter(Boolean);
  }, [current]);

  const filterJobs = (jobs) => {
    const keyword = searchText.toLowerCase().trim();

    return jobs.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const company = (job.company_name || "").toLowerCase();
      const location =
        typeof job.location === "string"
          ? job.location.toLowerCase()
          : job.location?.toLowerCase?.() || "";

      const type = getJobType(job);
      const role = getRole(job.title || "");

      const matchSearch =
        !keyword ||
        title.includes(keyword) ||
        company.includes(keyword) ||
        location.includes(keyword);

      const matchType = jobType === "All" || type === jobType;
      const matchRole = selectedRole === "All" || role === selectedRole;

      return matchSearch && matchType && matchRole;
    });
  };

  const filteredPostedJobs = useMemo(() => {
    return filterJobs(postedJobs);
  }, [postedJobs, searchText, jobType, selectedRole]);

  const filteredRecommendedJobs = useMemo(() => {
    const baseFiltered = filterJobs(recommendedJobs);

    if (candidateKeywords.length === 0) return baseFiltered.slice(0, 20);

    return baseFiltered
      .filter((job) => {
        const text = [
          job.title || "",
          job.company_name || "",
          typeof job.location === "string" ? job.location : "",
        ]
          .join(" ")
          .toLowerCase();

        return candidateKeywords.some((kw) => text.includes(kw));
      })
      .slice(0, 20);
  }, [
    recommendedJobs,
    searchText,
    jobType,
    selectedRole,
    candidateKeywords,
  ]);

  const searchGoogle = (job) => {
    const query = encodeURIComponent(
      `${job.company_name || ""} ${job.title || ""} official job`
    );
    window.open(
      `https://www.google.com/search?q=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openApply = (job) => {
    if (job.url && job.url.trim()) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    } else {
      searchGoogle(job);
    }
  };

  const renderJobCard = (job, showSearch = false, showHrLabel = false) => (
    <div
      key={job.id || job.url || `${job.company_name}-${job.title}`}
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        marginBottom: "12px",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      <h3>{job.company_name || "Unknown Company"}</h3>
      <p>{job.title || "No title"}</p>
      <p>
        {getJobType(job)} | {getRole(job.title || "")}
      </p>

      {job.location && (
        <p>
          {typeof job.location === "string"
            ? job.location
            : job.location?.name || ""}
        </p>
      )}

      {job.description && <p>{job.description}</p>}

      {showHrLabel && (
        <p style={{ fontWeight: "bold" }}>Posted by HR</p>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        <button onClick={() => openApply(job)}>Apply</button>

        {showSearch && (
          <button onClick={() => searchGoogle(job)}>Search</button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Profiles</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            navigate("/auth");
          }}
        >
          Logout
        </button>

        <button onClick={() => navigate("/candidate/new")}>+ Add Profile</button>
        <ChatPopup
          currentUser={{
            id: current?.id,
            name: current?.profiles?.[0]?.name || current?.email || "Current User",
          }}
          users={chatUsers}
        />
      </div>

      {current?.profiles?.length > 0 ? (
        current.profiles.map((profile) => (
          <div
            key={profile.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{profile.name || "No name"}</h3>
            <p>{profile.role || "No role"}</p>
            <p>{Array.isArray(profile.skills) ? profile.skills.join(", ") : ""}</p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() =>
                  navigate(`/hr/view/${profile.id}`, { state: { user: profile } })
                }
              >
                View Detail
              </button>

              <button
                onClick={() =>
                  navigate(`/candidate/edit/${profile.id}`, {
                    state: { user: profile },
                  })
                }
              >
                Edit
              </button>

              <button
                onClick={() => deleteResume(profile.id)}
                style={{ color: "red" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No profiles yet</p>
      )}



      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <input
          placeholder="Search jobs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ padding: "8px", minWidth: "220px" }}
        />

        <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="Intern">Intern</option>
          <option value="Part-time">Part-time</option>
          <option value="Full-time">Full-time</option>
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {allRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <h2>Jobs Posted by HR</h2>
      <div style={{ marginTop: "20px" }}>
        {filteredPostedJobs.length === 0 ? (
          <p>No HR-posted jobs yet.</p>
        ) : (
          filteredPostedJobs.map((job) => renderJobCard(job, false))
        )}
      </div>

      <h2 style={{ marginTop: "30px" }}>Jobs Oppotunities</h2>
      <p style={{ fontSize: "14px", opacity: 0.8, marginTop: "6px" }}>
        If the Apply link is outdated, click Search to find the latest posting.
      </p>
      <div style={{ marginTop: "20px" }}>
        {loadingRecommended ? (
          <p>Loading recommended jobs...</p>
        ) : filteredRecommendedJobs.length === 0 ? (
          <p>No recommended jobs found.</p>
        ) : (
          filteredRecommendedJobs.map((job) => renderJobCard(job, true))
        )}
      </div>

    </div>
  );
}

export default Candidate;