import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { submitRecommendationPayload } from "../api/api";
import PayloadForm from "../components/PayloadForm";
import PrebuiltCases from "../components/PrebuiltCases";
import { useAuth } from "../context/AuthContext";
import { createBasePayload } from "../utils/constants";

export default function Simulator() {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const { user } = useAuth();
  const basePayload = useMemo(
    () => createBasePayload(chapterId, user?.student_id),
    [chapterId, user?.student_id],
  );

  const [payload, setPayload] = useState(basePayload);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field, value) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
  };

  const applyCase = (item) => {
    setPayload((prev) => ({
      ...prev,
      ...item.values,
      chapter_id: chapterId,
      student_id: user?.student_id || prev.student_id,
      session_id: `sess-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await submitRecommendationPayload(payload);
      navigate("/result", { state: { result } });
    } catch (requestError) {
      const errors = requestError?.response?.data?.errors;
      const detail = requestError?.response?.data?.detail;
      setError(
        detail ||
          (Array.isArray(errors) ? errors.join(", ") : "Request failed."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Simulator</h1>
          <p>Chapter: {chapterId}</p>
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </header>

      <PrebuiltCases onSelect={applyCase} />

      {error && <p className="error-message">{error}</p>}

      <PayloadForm
        payload={payload}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
