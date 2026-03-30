import { useParams, useLocation, useNavigate } from "react-router-dom";

function HRview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const candidate =
    location.state?.user ||
    JSON.parse(localStorage.getItem("accounts"))
      ?.flatMap((acc) => acc.profiles || [])
      ?.find((profile) => String(profile.id) === String(id));

  if (!candidate) {
    return (
      <div style={{ padding: "20px" }}>
        <p>No candidate data available.</p>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Candidate Details</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
        <div>
          <strong>Name:</strong>
          <p>{candidate.name || "N/A"}</p>
        </div>

        <div>
          <strong>Email:</strong>
          <p>{candidate.email || "N/A"}</p>
        </div>

        <div>
          <strong>Role:</strong>
          <p>{candidate.role || "N/A"}</p>
        </div>

        <div>
          <strong>Category:</strong>
          <p>{candidate.category || "N/A"}</p>
        </div>

        <div>
          <strong>Location:</strong>
          <p>{candidate.location || "N/A"}</p>
        </div>

        <div>
          <strong>Education:</strong>
          <p>{candidate.education || "N/A"}</p>
        </div>

        <div>
          <strong>Summary:</strong>
          <p>{candidate.summary || "N/A"}</p>
        </div>

        <div>
          <strong>Skills:</strong>
          <p>
            {Array.isArray(candidate.skills)
              ? candidate.skills.join(", ")
              : candidate.skills || "N/A"}
          </p>
        </div>

        <div>
          <strong>Certifications:</strong>
          <p>
            {Array.isArray(candidate.certifications)
              ? candidate.certifications.join(", ")
              : candidate.certifications || "N/A"}
          </p>
        </div>

        <div>
          <strong>Licenses:</strong>
          <p>
            {Array.isArray(candidate.licenses)
              ? candidate.licenses.join(", ")
              : candidate.licenses || "N/A"}
          </p>
        </div>

        <div>
          <strong>LinkedIn:</strong>
          {candidate.linkedin ? (
            <p>
              <a href={candidate.linkedin} target="_blank" rel="noreferrer">
                Open LinkedIn
              </a>
            </p>
          ) : (
            <p>N/A</p>
          )}
        </div>

        <div>
          <strong>Portfolio:</strong>
          {candidate.portfolio ? (
            <p>
              <a href={candidate.portfolio} target="_blank" rel="noreferrer">
                Open Portfolio
              </a>
            </p>
          ) : (
            <p>N/A</p>
          )}
        </div>

        <div>
          <strong>GitHub:</strong>
          {candidate.github ? (
            <p>
              <a href={candidate.github} target="_blank" rel="noreferrer">
                Open GitHub
              </a>
            </p>
          ) : (
            <p>N/A</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}

export default HRview;