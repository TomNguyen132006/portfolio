import { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./Main.css";

function HRview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const accountFromState = location.state?.candidateAccount || null;
  const profileFromState = location.state?.user || null;

  const accountFromStorage = useMemo(() => {
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");

    if (accountFromState?.id) {
      return (
        accounts.find((acc) => String(acc.id) === String(accountFromState.id)) ||
        accountFromState
      );
    }

    return (
      accounts.find(
        (acc) =>
          acc.role === "candidate" &&
          Array.isArray(acc.profiles) &&
          acc.profiles.some((profile) => String(profile.id) === String(id))
      ) || null
    );
  }, [accountFromState, id]);

  const profiles = Array.isArray(accountFromStorage?.profiles)
    ? accountFromStorage.profiles
    : [];

  const mainProfile =
    profiles.find(
      (profile) =>
        String(profile.id) === String(accountFromStorage?.primaryProfileId)
    ) ||
    profileFromState ||
    profiles.find((profile) => String(profile.id) === String(id)) ||
    profiles[0] ||
    null;

  const [activeProfileId, setActiveProfileId] = useState(
    mainProfile ? String(mainProfile.id) : ""
  );

  const activeProfile =
    profiles.find((profile) => String(profile.id) === String(activeProfileId)) ||
    mainProfile;

  const otherProfiles = profiles.filter(
    (profile) => String(profile.id) !== String(activeProfile?.id)
  );

  if (!activeProfile) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <nav className="navbar">
          <span className="navbar-logo">PortfolioHub</span>
        </nav>

        <div
          className="page"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <p style={{ color: "var(--text-muted)", marginBottom: "1.2rem" }}>
            No candidate data found.
          </p>
          <button className="btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Email", value: accountFromStorage?.email || activeProfile.email },
    { label: "Role", value: activeProfile.role },
    { label: "Country", value: activeProfile.country },
    { label: "Location", value: activeProfile.location },
    { label: "Education", value: activeProfile.education },
    {
      label: "Certifications",
      value: Array.isArray(activeProfile.certifications)
        ? activeProfile.certifications.join(", ")
        : activeProfile.certifications,
    },
    {
      label: "Licenses",
      value: Array.isArray(activeProfile.licenses)
        ? activeProfile.licenses.join(", ")
        : activeProfile.licenses,
    },
    { label: "Category", value: activeProfile.category },
    { label: "Work Authorization", value: activeProfile.workAuthorization },
    { label: "Needs Sponsorship", value: activeProfile.needsSponsorship },
    { label: "OPT/CPT Status", value: activeProfile.optStatus },

    
  ];

  const links = [
    { label: "GitHub", href: activeProfile.github },
    { label: "LinkedIn", href: activeProfile.linkedin },
  ].filter((link) => link.href);

  const skills = Array.isArray(activeProfile.skills)
    ? activeProfile.skills
    : activeProfile.skills?.split(",").map((s) => s.trim()) || [];

  const isMainResume =
    String(activeProfile.id) ===
    String(accountFromStorage?.primaryProfileId || mainProfile?.id);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav className="navbar">
        <span className="navbar-logo">PortfolioHub</span>
        <div className="navbar-right">
          <button className="btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </nav>

      <div className="page" style={{ maxWidth: "1000px" }}>
        <div
          className="card fade-up"
          style={{ marginBottom: "1.5rem", padding: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p className="section-subtitle">
                {isMainResume ? "Main Resume" : "Alternate Resume"}
              </p>

              <h1
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  marginBottom: "4px",
                }}
              >
                {activeProfile.name || "No Name"}
              </h1>

              <p className="candidate-role">{activeProfile.role || "—"}</p>

              {!isMainResume && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginTop: "0.35rem",
                  }}
                >
                  Viewing one of the candidate’s alternate resumes
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <button className="btn" style={{ fontSize: "0.72rem" }}>
                    {link.label} ↗
                  </button>
                </a>
              ))}

              {!isMainResume && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "0.72rem" }}
                  onClick={() =>
                    setActiveProfileId(
                      String(accountFromStorage?.primaryProfileId || mainProfile?.id)
                    )
                  }
                >
                  Back to Main Resume
                </button>
              )}
            </div>
          </div>

          {skills.length > 0 && (
            <div
              style={{
                marginTop: "1.2rem",
                paddingTop: "1.2rem",
                borderTop: "1px solid var(--border)",
              }}
            >
              <p className="repo-label">Skills</p>
              <div>
                {skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {profiles.length > 1 && (
          <div
            className="card fade-up"
            style={{
              animationDelay: "0.04s",
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <p className="repo-label" style={{ marginBottom: "0.35rem" }}>
                  Resume Versions
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  This candidate has {profiles.length} total resumes.
                </p>
              </div>

              <select
                className="filter-select"
                value={String(activeProfile.id)}
                onChange={(e) => setActiveProfileId(String(e.target.value))}
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={String(profile.id)}>
                    {profile.name || "Untitled Resume"} —{" "}
                    {profile.role || "No role"}
                    {String(profile.id) ===
                    String(accountFromStorage?.primaryProfileId || mainProfile?.id)
                      ? " (Main)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {otherProfiles.length > 0 && (
              <div>
                <p
                  className="repo-label"
                  style={{ marginBottom: "0.8rem", marginTop: "1rem" }}
                >
                  Other Resumes
                </p>

                <div className="grid-candidates">
                  {otherProfiles.map((profile) => (
                    <div key={profile.id} className="repo-item">
                      <p className="repo-name">{profile.name || "No name"}</p>
                      <p className="repo-desc">{profile.role || "No role"}</p>

                      {Array.isArray(profile.skills) &&
                        profile.skills.length > 0 && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            {profile.skills.slice(0, 4).map((skill) => (
                              <span key={skill} className="tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                      <button
                        className="btn"
                        style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                        onClick={() => setActiveProfileId(String(profile.id))}
                      >
                        View This Resume
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="card fade-up"
          style={{
            animationDelay: "0.08s",
            padding: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          <p className="repo-label" style={{ marginBottom: "1.2rem" }}>
            Details
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {fields.map((field) =>
              field.value ? (
                <div key={field.label}>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                      marginBottom: "4px",
                    }}
                  >
                    {field.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text)",
                      lineHeight: 1.5,
                    }}
                  >
                    {field.value}
                  </p>
                </div>
              ) : null
            )}
          </div>
        </div>

        {activeProfile.resumeFile && (
          <div
            className="card fade-up"
            style={{
              animationDelay: "0.1s",
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <p className="repo-label" style={{ marginBottom: "0.8rem" }}>
              Resume
            </p>

            {activeProfile.resumeName && (
              <p
                style={{
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                  color: "var(--text-muted)",
                }}
              >
                {activeProfile.resumeName}
              </p>
            )}

            <iframe
              src={activeProfile.resumeFile}
              title={`resume-${activeProfile.id}`}
              width="100%"
              height="600px"
              style={{
                border: "1px solid var(--border)",
                borderRadius: "12px",
              }}
            />
          </div>
        )}

        {activeProfile.summary && (
          <div
            className="card fade-up"
            style={{
              animationDelay: "0.12s",
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <p className="repo-label" style={{ marginBottom: "0.8rem" }}>
              Summary
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}
            >
              {activeProfile.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HRview;