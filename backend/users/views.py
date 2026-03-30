from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import Student


def _build_token_payload(user):
	refresh = RefreshToken.for_user(user)
	student = Student.objects.filter(user=user).first()
	return {
		"access": str(refresh.access_token),
		"refresh": str(refresh),
		"user": {
			"id": user.id,
			"username": user.username,
			"email": user.email,
			"student_id": student.student_id if student else None,
		},
	}


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
	username = (request.data.get("username") or "").strip()
	password = request.data.get("password")
	email = (request.data.get("email") or "").strip()
	student_id = (request.data.get("student_id") or "").strip()
	grade = request.data.get("grade", 7)

	if not username or not password:
		return Response(
			{"detail": "username and password are required."},
			status=status.HTTP_400_BAD_REQUEST,
		)

	if User.objects.filter(username=username).exists():
		return Response({"detail": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

	user = User.objects.create_user(username=username, password=password, email=email)
	Student.objects.create(
		user=user,
		student_id=student_id or f"STD-{user.id}",
		grade=max(6, min(int(grade), 8)) if str(grade).isdigit() else 7,
	)

	return Response(_build_token_payload(user), status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
	username = (request.data.get("username") or "").strip()
	password = request.data.get("password")

	user = authenticate(username=username, password=password)
	if not user:
		return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

	return Response(_build_token_payload(user), status=status.HTTP_200_OK)
