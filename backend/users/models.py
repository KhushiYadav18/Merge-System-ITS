from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
	student_id = models.CharField(max_length=64, unique=True)
	grade = models.PositiveSmallIntegerField(default=7)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.student_id} ({self.user.username})"
