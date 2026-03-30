from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from chapters.data import CHAPTERS


@api_view(["GET"])
def list_chapters(request):
	return Response(CHAPTERS, status=status.HTTP_200_OK)


@api_view(["GET"])
def chapter_detail(request, chapter_id):
	chapter = next((item for item in CHAPTERS if item["chapter_id"] == chapter_id), None)
	if not chapter:
		return Response({"detail": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND)
	return Response(chapter, status=status.HTTP_200_OK)
