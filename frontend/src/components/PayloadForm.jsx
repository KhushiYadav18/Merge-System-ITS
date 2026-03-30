const INPUT_FIELDS = [
  ["student_id", "text"],
  ["session_id", "text"],
  ["chapter_id", "text"],
  ["timestamp", "datetime-local"],
  ["session_status", "select"],
  ["correct_answers", "number"],
  ["wrong_answers", "number"],
  ["questions_attempted", "number"],
  ["total_questions", "number"],
  ["retry_count", "number"],
  ["hints_used", "number"],
  ["total_hints_embedded", "number"],
  ["time_spent_seconds", "number"],
  ["topic_completion_ratio", "number"],
];

/**
 * Validation rules derived from backend validators.py
 * These help catch issues early in the UI
 */
function getPayloadValidationErrors(payload) {
  const errors = [];

  // Question constraints
  const correctPlusWrong = payload.correct_answers + payload.wrong_answers;
  if (correctPlusWrong !== payload.questions_attempted) {
    errors.push(
      `correct_answers (${payload.correct_answers}) + wrong_answers (${payload.wrong_answers}) ` +
        `must equal questions_attempted (${payload.questions_attempted}), but got ${correctPlusWrong}`,
    );
  }

  if (payload.questions_attempted > payload.total_questions) {
    errors.push(
      `questions_attempted (${payload.questions_attempted}) cannot exceed ` +
        `total_questions (${payload.total_questions})`,
    );
  }

  if (payload.retry_count > payload.questions_attempted) {
    errors.push(
      `retry_count (${payload.retry_count}) cannot exceed ` +
        `questions_attempted (${payload.questions_attempted})`,
    );
  }

  if (payload.hints_used > payload.total_hints_embedded) {
    errors.push(
      `hints_used (${payload.hints_used}) cannot exceed ` +
        `total_hints_embedded (${payload.total_hints_embedded})`,
    );
  }

  // Session status constraint
  if (
    payload.session_status === "completed" &&
    payload.questions_attempted !== payload.total_questions
  ) {
    errors.push(
      `Completed sessions must attempt all questions. ` +
        `If questions_attempted (${payload.questions_attempted}) ≠ total_questions (${payload.total_questions}), ` +
        `set session_status to "exited_midway"`,
    );
  }

  return errors;
}

function normalizeTimestampForInput(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function PayloadForm({
  payload,
  onChange,
  onSubmit,
  isSubmitting,
}) {
  const validationErrors = getPayloadValidationErrors(payload);
  const isValid = validationErrors.length === 0;

  const handleFieldChange = (field, type, value) => {
    if (field === "timestamp") {
      if (!value) {
        onChange(field, "");
        return;
      }
      onChange(field, new Date(value).toISOString());
      return;
    }

    if (type === "number") {
      onChange(field, value === "" ? "" : Number(value));
      return;
    }

    onChange(field, value);
  };

  return (
    <form className="card payload-form" onSubmit={onSubmit}>
      <h3>Session Payload</h3>

      {!isValid && (
        <div className="validation-errors">
          <h4>⚠️ Validation Errors:</h4>
          <ul>
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-grid">
        {INPUT_FIELDS.map(([field, type]) => (
          <label key={field}>
            <span>{field}</span>
            {type === "select" ? (
              <select
                value={payload[field]}
                onChange={(event) =>
                  handleFieldChange(field, type, event.target.value)
                }
              >
                <option value="completed">completed</option>
                <option value="exited_midway">exited_midway</option>
              </select>
            ) : (
              <input
                type={type}
                step={field === "topic_completion_ratio" ? "0.01" : undefined}
                min={type === "number" ? 0 : undefined}
                max={field === "topic_completion_ratio" ? 1 : undefined}
                value={
                  field === "timestamp"
                    ? normalizeTimestampForInput(payload[field])
                    : payload[field]
                }
                onChange={(event) =>
                  handleFieldChange(field, type, event.target.value)
                }
                required
              />
            )}
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="primary-btn"
        disabled={isSubmitting || !isValid}
        title={!isValid ? "Fix validation errors above before submitting" : ""}
      >
        {isSubmitting ? "Computing Recommendation..." : "Submit Payload"}
      </button>
    </form>
  );
}
