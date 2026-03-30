from django.urls import path

from recommendations.views import recommend_view

urlpatterns = [
    path("recommend/", recommend_view, name="recommend"),
]
