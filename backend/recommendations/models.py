from django.db import models


class RecommendationResult(models.Model):
	student_id = models.CharField(max_length=64)
	chapter_id = models.CharField(max_length=128)
	performance_score = models.FloatField()
	confidence_score = models.FloatField()
	learning_state = models.CharField(max_length=16)
	diagnosis = models.JSONField(default=dict)
	recommendation = models.JSONField(default=dict)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.student_id} - {self.chapter_id} - {self.learning_state}"
