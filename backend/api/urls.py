from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyDetailViewSet,
    DashboardSummaryViewSet,
    UserDetailViewSet,
    UserDropdownViewSet,
)


# A router automatically creates the CRUD URLs for the UserDetailViewSet.
router = DefaultRouter()
router.register('user-details', UserDetailViewSet, basename='user-detail')
router.register('company-details', CompanyDetailViewSet, basename='company-detail')
router.register('user-dropdown', UserDropdownViewSet, basename='user-dropdown')
router.register(
    'dashboard-summary',
    DashboardSummaryViewSet,
    basename='dashboard-summary',
)

urlpatterns = [
    path('', include(router.urls)),
]
