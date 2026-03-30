from django.urls import path

from chapters.views import chapter_detail, list_chapters

urlpatterns = [
    path("", list_chapters, name="chapters_list"),
    path("<str:chapter_id>/", chapter_detail, name="chapters_detail"),
]
