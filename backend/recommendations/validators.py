from datetime import datetime

from utils.helpers import get_chapter_metadata


REQUIRED_FIELDS = {
	"student_id": str,
	"session_id": str,
	"chapter_id": str,
	"timestamp": str,
	"session_status": str,
	"correct_answers": int,
	"wrong_answers": int,
	"questions_attempted": int,
	"total_questions": int,
	"retry_count": int,
	"hints_used": int,
	"total_hints_embedded": int,
	"time_spent_seconds": int,
	"topic_completion_ratio": float,
}

ALLOWED_SESSION_STATUS = {"completed", "exited_midway"}
NON_EMPTY_STRING_FIELDS = {"student_id", "session_id", "chapter_id", "timestamp", "session_status"}


def _is_iso8601(value):
	try:
		datetime.fromisoformat(value.replace("Z", "+00:00"))
		return True
	except (ValueError, TypeError):
		return False


def validate_recommendation_payload(payload):
	errors = []

	for field, expected_type in REQUIRED_FIELDS.items():
		if field not in payload:
			errors.append(f"Missing field: {field}")
			continue

		value = payload[field]
		if expected_type is float and not isinstance(value, (int, float)):
			errors.append(f"Invalid type for {field}. Expected float.")
		elif expected_type is int and not isinstance(value, int):
			errors.append(f"Invalid type for {field}. Expected int.")
		elif expected_type is str and not isinstance(value, str):
			errors.append(f"Invalid type for {field}. Expected string.")

	if errors:
		return {"is_valid": False, "errors": errors}

	for field in NON_EMPTY_STRING_FIELDS:
		if not payload[field].strip():
			errors.append(f"{field} cannot be empty.")

	if payload["session_status"] not in ALLOWED_SESSION_STATUS:
		errors.append("session_status must be 'completed' or 'exited_midway'.")

	if not _is_iso8601(payload["timestamp"]):
		errors.append("timestamp must be a valid ISO-8601 datetime.")

	if payload["correct_answers"] < 0 or payload["wrong_answers"] < 0:
		errors.append("correct_answers and wrong_answers cannot be negative.")

	if payload["questions_attempted"] < 0 or payload["total_questions"] < 0:
		errors.append("questions_attempted and total_questions cannot be negative.")

	if payload["retry_count"] < 0 or payload["hints_used"] < 0 or payload["total_hints_embedded"] < 0:
		errors.append("retry_count, hints_used and total_hints_embedded cannot be negative.")

	if payload["time_spent_seconds"] < 0:
		errors.append("time_spent_seconds cannot be negative.")

	if payload["hints_used"] > payload["total_hints_embedded"]:
		errors.append("Validation failed: hints_used must be <= total_hints_embedded.")

	if payload["retry_count"] > payload["questions_attempted"]:
		errors.append("Validation failed: retry_count must be <= questions_attempted.")

	if not 0 <= float(payload["topic_completion_ratio"]) <= 1:
		errors.append("topic_completion_ratio must be between 0 and 1.")

	correct = payload["correct_answers"]
	wrong = payload["wrong_answers"]
	attempted = payload["questions_attempted"]
	total = payload["total_questions"]

	if correct + wrong > attempted:
		errors.append("Validation failed: correct + wrong must be <= attempted.")

	if attempted > total:
		errors.append("Validation failed: attempted must be <= total.")

	if payload["session_status"] == "completed" and attempted < total:
		errors.append("Validation failed: completed sessions must attempt all total questions.")

	chapter_metadata = get_chapter_metadata(payload["chapter_id"])
	if not chapter_metadata:
		errors.append("chapter_id not found in chapter metadata.")

	return {
		"is_valid": len(errors) == 0,
		"errors": errors,
		"chapter_metadata": chapter_metadata,
	}
