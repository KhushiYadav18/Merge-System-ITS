from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recommendations.logic import generate_recommendation
from recommendations.models import RecommendationResult
from recommendations.validators import validate_recommendation_payload


def _enrich_with_history(result, history_rows):
	if not history_rows:
		result["diagnosis"]["history"] = {
			"past_attempts": 0,
			"trend": "new",
		}
		return result

	performances = [row.performance_score for row in history_rows]
	avg_performance = sum(performances) / len(performances)
	trend_delta = performances[0] - performances[-1] if len(performances) > 1 else 0.0

	if trend_delta > 0.08:
		trend = "improving"
	elif trend_delta < -0.08:
		trend = "declining"
	else:
		trend = "stable"

	if len(performances) >= 3 and avg_performance < 0.45 and result["learning_state"] != "weak":
		result["learning_state"] = "moderate"
		result["recommendation"] = {
			"type": "revision",
			"reason": "Past attempts show persistent gaps, so revision is safer than advancing.",
			"next_steps": [
				"Review past mistakes before retrying this chapter.",
				"Retake a guided practice set with fewer hints.",
			],
		}

	result["diagnosis"]["history"] = {
		"past_attempts": len(performances),
		"avg_performance": round(avg_performance, 4),
		"trend": trend,
	}

	return result


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recommend_view(request):
	payload = request.data
	validation = validate_recommendation_payload(payload)

	if not validation["is_valid"]:
		return Response({"errors": validation["errors"]}, status=status.HTTP_400_BAD_REQUEST)

	history_rows = list(
		RecommendationResult.objects.filter(
			student_id=payload["student_id"],
			chapter_id=payload["chapter_id"],
		)
		.order_by("-created_at")[:5]
	)

	result = generate_recommendation(payload, validation["chapter_metadata"])
	result = _enrich_with_history(result, history_rows)
	RecommendationResult.objects.create(
		student_id=result["student_id"],
		chapter_id=result["chapter_id"],
		performance_score=result["performance_score"],
		confidence_score=result["confidence_score"],
		learning_state=result["learning_state"],
		diagnosis=result["diagnosis"],
		recommendation=result["recommendation"],
	)

	return Response(result, status=status.HTTP_200_OK)
