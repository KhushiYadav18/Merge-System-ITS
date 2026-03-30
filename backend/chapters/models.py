from django.db import models


class Chapter(models.Model):
	chapter_id = models.CharField(max_length=128, unique=True)
	chapter_name = models.CharField(max_length=255)
	chapter_difficulty = models.FloatField()
	expected_completion_time_seconds = models.PositiveIntegerField()
	prerequisites_csv = models.TextField(default="")

	class Meta:
		managed = False

	def __str__(self):
		return self.chapter_id
