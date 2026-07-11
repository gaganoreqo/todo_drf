from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AccountAdminViewSet,
    CompanyDetailViewSet,
    DashboardSummaryViewSet,
    LoginView,
    MeView,
    SignupView,
    UserDetailViewSet,
    UserDropdownViewSet,
)


# A router automatically creates the CRUD URLs for the UserDetailViewSet.
router = DefaultRouter()
router.register('user-details', UserDetailViewSet, basename='user-detail')
router.register('company-details', CompanyDetailViewSet, basename='company-detail')
router.register('user-dropdown', UserDropdownViewSet, basename='user-dropdown')
router.register('accounts', AccountAdminViewSet, basename='account')
router.register(
    'dashboard-summary',
    DashboardSummaryViewSet,
    basename='dashboard-summary',
)

urlpatterns = [
    path('auth/signup/', SignupView.as_view(), name='auth-signup'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('', include(router.urls)),
]
