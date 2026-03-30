import { useLocation, useNavigate } from "react-router-dom";

function Meter({ value }) {
  const width = `${Math.max(0, Math.min(100, value * 100))}%`;
  return (
    <div className="meter">
      <div style={{ width }} />
    </div>
  );
}

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  const history = result?.diagnosis?.history;

  if (!result) {
    return (
      <main className="page">
        <section className="card">
          <h2>No recommendation result found.</h2>
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Recommendation Result</h1>
          <p>
            Student: {result.student_id} | Chapter: {result.chapter_id}
          </p>
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
      </header>

      <section className="card">
        <p>Performance Score: {result.performance_score}</p>
        <Meter value={result.performance_score} />

        <p>Confidence Score: {result.confidence_score}</p>
        <Meter value={result.confidence_score} />

        <p>
          Learning State: <strong>{result.learning_state}</strong>
        </p>
      </section>

      <section className="card">
        <h3>Diagnosis</h3>
        <ul>
          <li>Accuracy: {result.diagnosis.accuracy}</li>
          <li>Hint Dependency: {result.diagnosis.hint_dependency}</li>
          <li>Retry Behavior: {result.diagnosis.retry_behavior}</li>
          <li>Time Efficiency: {result.diagnosis.time_efficiency}</li>
        </ul>
        {history && (
          <p className="history-chip">
            History: {history.past_attempts} past attempt(s) | Trend:{" "}
            {history.trend}
          </p>
        )}
      </section>

      <section className="card">
        <h3>Recommendation</h3>
        <p>Type: {result.recommendation.type}</p>
        <p>Reason: {result.recommendation.reason}</p>
        <ul>
          {(result.recommendation.next_steps || []).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>

      <div className="row-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={() => navigate("/dashboard")}
        >
          Choose Another Chapter
        </button>
      </div>
    </main>
  );
}
