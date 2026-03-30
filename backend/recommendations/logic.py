from utils.helpers import clamp, safe_divide


def _to_level(value):
	if value < 0.33:
		return "low"
	if value < 0.66:
		return "moderate"
	return "high"


def _build_recommendation(learning_state, chapter_metadata, metrics):
	prerequisites = chapter_metadata.get("prerequisites", [])
	next_chapter_id = chapter_metadata.get("next_chapter_id")

	if learning_state == "weak":
		prerequisite = prerequisites[0] if prerequisites else chapter_metadata["chapter_id"]
		return {
			"type": "prerequisite",
			"reason": "Low performance indicates foundational gaps.",
			"next_steps": [
				f"Revisit prerequisite chapter: {prerequisite}",
				"Complete guided revision before retrying this chapter.",
			],
		}

	if learning_state == "moderate":
		if metrics["H"] > 0.5:
			return {
				"type": "revision",
				"reason": "High hint dependency detected.",
				"next_steps": [
					"Revise concepts with fewer hints.",
					"Attempt a short quiz without assistance.",
				],
			}
		if metrics["R"] > 0.6:
			return {
				"type": "practice",
				"reason": "High retry behavior suggests conceptual struggle.",
				"next_steps": [
					"Do targeted practice sets for incorrect question types.",
					"Review step-by-step worked examples.",
				],
			}
		if metrics["Cov"] < 0.7:
			return {
				"type": "complete",
				"reason": "Coverage is below expected threshold.",
				"next_steps": [
					"Finish remaining questions in this chapter.",
					"Reassess after full chapter completion.",
				],
			}
		return {
			"type": "practice",
			"reason": "Moderate understanding needs reinforcement.",
			"next_steps": [
				"Attempt mixed-difficulty practice.",
				"Retake chapter assessment.",
			],
		}

	target = next_chapter_id or chapter_metadata["chapter_id"]
	return {
		"type": "next_chapter",
		"reason": "Strong performance and stable behavior detected.",
		"next_steps": [
			f"Proceed to: {target}",
			"Attempt challenge-level problems to maintain momentum.",
		],
	}


def generate_recommendation(payload, chapter_metadata):
	attempted = payload["questions_attempted"]
	total = payload["total_questions"]
	correct = payload["correct_answers"]
	retry = payload["retry_count"]
	hints = payload["hints_used"]
	total_hints = payload["total_hints_embedded"]
	time_spent = payload["time_spent_seconds"]
	completion_ratio = payload["topic_completion_ratio"]

	expected_time = chapter_metadata["expected_completion_time_seconds"]
	difficulty = chapter_metadata["chapter_difficulty"]

	# 1) METRICS
	A = clamp(safe_divide(correct, max(attempted, 1)))
	H = clamp(safe_divide(hints, max(total_hints, 1)))
	R = clamp(min(safe_divide(retry, max(attempted, 1)), 1.0))
	E = clamp(min(safe_divide(expected_time, max(time_spent, 1)), 1.0))
	Cov = clamp(safe_divide(attempted, max(total, 1)))
	C = clamp(completion_ratio)
	Tb = safe_divide(time_spent, max(expected_time, 1), default=1.0)

	# 2) PERFORMANCE SCORE
	P = 0.30 * A + 0.15 * Cov + 0.15 * E + 0.15 * (1 - H) + 0.10 * (1 - R) + 0.15 * C

	# 3) BEHAVIORAL ADJUSTMENTS
	if A > 0.75 and Tb < 0.5:
		P = P - 0.1
	if H > 0.5:
		P = P * (1 - 0.2 * H)
	if R > 0.6 and A < 0.5:
		P = P - 0.15
	if A > 0.7 and H < 0.2 and R < 0.3:
		P = P + 0.1

	P = clamp(P)

	# 4) DIFFICULTY SCALING
	scaled_performance = clamp(P * (1 + 0.3 * (difficulty - 0.5)))

	# 5) CONFIDENCE
	confidence = 0.4 * Cov + 0.3 * C + 0.3 * (1 - R)

	# 8) EDGE CASE ADJUSTMENTS FOR CONFIDENCE
	if attempted == 0:
		confidence *= 0.3
	if time_spent == 0:
		confidence *= 0.7
	if payload["session_status"] == "exited_midway":
		confidence *= 0.7
	confidence = clamp(confidence)

	# 6) CLASSIFICATION
	if scaled_performance < 0.4:
		learning_state = "weak"
	elif scaled_performance < 0.7:
		learning_state = "moderate"
	else:
		learning_state = "strong"

	# 8) EDGE-CASE FLAGS
	high_speed_guessing = Tb < 0.5 and A < 0.5
	high_retry_struggle = R > 0.6
	hints_accuracy_dependency = H > 0.5 and A > 0.7

	diagnosis = {
		"accuracy": round(A, 4),
		"hint_dependency": _to_level(H),
		"retry_behavior": _to_level(R),
		"time_efficiency": _to_level(E),
	}

	recommendation = _build_recommendation(
		learning_state,
		chapter_metadata,
		{"H": H, "R": R, "Cov": Cov},
	)

	return {
		"student_id": payload["student_id"],
		"chapter_id": payload["chapter_id"],
		"performance_score": round(scaled_performance, 4),
		"confidence_score": round(confidence, 4),
		"learning_state": learning_state,
		"diagnosis": diagnosis,
		"recommendation": recommendation,
	}
