from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import UserDetailViewSet


# A router automatically creates the CRUD URLs for the UserDetailViewSet.
router = DefaultRouter()
router.register('user-details', UserDetailViewSet, basename='user-detail')

urlpatterns = [
    path('', include(router.urls)),
]
