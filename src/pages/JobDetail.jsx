import { useLocation, useNavigate } from "react-router-dom";

function JobDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const job = state?.job;

  if (!job) {
    return <p>Job not found</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h1>{job.title}</h1>

      <p><strong>Company:</strong> {job.company_name}</p>
      <p><strong>Location:</strong> {job.location || "N/A"}</p>
      <p><strong>Type:</strong> {job.type || "N/A"}</p>

      {job.description && (
        <div style={{ marginTop: "20px" }}>
          <h3>Description</h3>
          <p>{job.description}</p>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        {job.url ? (
          <a href={job.url} target="_blank" rel="noreferrer">
            Apply
          </a>
        ) : (
          <button
            onClick={() => {
              const q = encodeURIComponent(
                `${job.company_name} ${job.title}`
              );
              window.open(
                `https://www.google.com/search?q=${q}`,
                "_blank"
              );
            }}
          >
            Search Job
          </button>
        )}
      </div>
    </div>
  );
}

export default JobDetail;