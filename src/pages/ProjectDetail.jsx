import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

import "./Main.css";

function ProjectDetail() {
  const { username, repoName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const repoFromState = location.state?.repo || null;

  const [repo, setRepo] = useState(repoFromState);
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(true);
  const [readmeError, setReadmeError] = useState("");

  useEffect(() => {
    const fetchRepoAndReadme = async () => {
      setLoading(true);
      setReadmeError("");

      try {
        let currentRepo = repoFromState;

        if (!currentRepo) {
          const repoRes = await fetch(
            `https://api.github.com/repos/${username}/${repoName}`
          );

          if (!repoRes.ok) {
            throw new Error("Failed to fetch repository");
          }

          currentRepo = await repoRes.json();
          setRepo(currentRepo);
        }

        const readmeRes = await fetch(
          `https://api.github.com/repos/${username}/${repoName}/readme`,
          {
            headers: {
              Accept: "application/vnd.github.raw+json",
            },
          }
        );

        if (!readmeRes.ok) {
          setReadmeError("README not found for this repository.");
          setReadme("");
        } else {
          const readmeText = await readmeRes.text();
          setReadme(readmeText);
        }
      } catch (error) {
        setReadmeError("Could not load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepoAndReadme();
  }, [username, repoName, repoFromState]);

  if (loading) {
    return (
      <div className="page">
        <p className="empty">Loading project...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="page" style={{ maxWidth: "900px", margin: "0 auto" }}>
        <button
          className="btn"
          style={{ marginBottom: "1.5rem" }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <p className="section-subtitle">Project Detail</p>
          <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>
            {repo?.name || repoName}
          </h1>

          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            {repo?.description || "No description available."}
          </p>

          {repo?.html_url && (
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "10px 16px",
                background: "linear-gradient(135deg, #24292e, #444c56)",
                color: "#fff",
                fontWeight: "600",
                textDecoration: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #0366d6, #2188ff)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 14px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #24292e, #444c56)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 10px rgba(0,0,0,0.15)";
              }}
            >
              Open on GitHub ↗
            </a>
          )}
        </div>

        <div className="card">
          <p className="section-subtitle">README</p>

          {readmeError ? (
            <p style={{ color: "var(--text-muted)" }}>{readmeError}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {readme}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;