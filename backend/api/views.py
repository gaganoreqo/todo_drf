from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter

from .jwt import create_access_token
from .models import Account, CompanyDetail, UserDetail
from .pagination import DynamicPageNumberPagination
from .permissions import IsAdminAccount
from .serializers import (
    AccountSerializer,
    CompanyDetailSerializer,
    LoginSerializer,
    SignupSerializer,
    UserDetailSerializer,
    UserDropdownSerializer,
)


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.save()

        return Response(
            {
                'access': create_access_token(account),
                'account': AccountSerializer(account).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.validated_data['account']

        return Response({
            'access': create_access_token(account),
            'account': AccountSerializer(account).data,
        })


class MeView(APIView):
    def get(self, request):
        return Response(AccountSerializer(request.user).data)


class AccountAdminViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAdminAccount]
    pagination_class = None
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def partial_update(self, request, *args, **kwargs):
        account = self.get_object()
        next_role = request.data.get('role', account.role)
        next_is_active = request.data.get('is_active', account.is_active)

        if account.id == request.user.id and self._is_false_value(next_is_active):
            return Response(
                {'detail': 'You cannot deactivate your own admin account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if account.id == request.user.id and next_role != Account.ROLE_ADMIN:
            return Response(
                {'detail': 'You cannot remove your own admin role.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            account.role == Account.ROLE_ADMIN
            and (
                next_role != Account.ROLE_ADMIN
                or self._is_false_value(next_is_active)
            )
            and self._is_last_active_admin(account)
        ):
            return Response(
                {'detail': 'At least one active admin account is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        account = self.get_object()

        if account.id == request.user.id:
            return Response(
                {'detail': 'You cannot deactivate your own admin account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if account.role == Account.ROLE_ADMIN and self._is_last_active_admin(account):
            return Response(
                {'detail': 'At least one active admin account is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        account.is_active = False
        account.save(update_fields=['is_active', 'updated_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _is_last_active_admin(self, account):
        return not Account.objects.filter(
            role=Account.ROLE_ADMIN,
            is_active=True,
        ).exclude(pk=account.pk).exists()

    def _is_false_value(self, value):
        return value in [False, 'false', 'False', '0', 0]


class DashboardSummaryViewSet(viewsets.ViewSet):
    def list(self, request):
        active_users = UserDetail.active_objects.count()
        deleted_users = UserDetail.deleted_objects.count()
        company_records = CompanyDetail.objects.count()
        account_count = Account.objects.count()
        available_users = UserDetail.active_objects.filter(
            company_details__isnull=True
        ).count()

        return Response({
            'active_users': active_users,
            'company_records': company_records,
            'deleted_users': deleted_users,
            'account_count': account_count,
            'available_users': available_users,
        })


# A ModelViewSet provides list, retrieve, create, update, partial_update,
# and destroy actions for the UserDetail model.
class UserDetailViewSet(viewsets.ModelViewSet):
    serializer_class = UserDetailSerializer
    pagination_class = DynamicPageNumberPagination
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'name',
        'gender',
        'company_details__company_name',
        'company_details__role',
        'company_details__location',
    ]
    ordering_fields = [
        'id',
        'name',
        'age',
        'gender',
        'company_details__company_name',
    ]
    ordering = ['id']

    def get_queryset(self):
        # By default, show only active records.
        # Use /api/v1/user-details/?deleted=true to list soft-deleted records.
        show_deleted = self.request.query_params.get('deleted') == 'true'
        manager = (
            UserDetail.deleted_objects
            if show_deleted
            else UserDetail.active_objects
        )
        queryset = manager.prefetch_related('company_details')
        params = self.request.query_params

        # Field-wise filters. These work together with global ?search=.
        name = params.get('name', '').strip()
        age = params.get('age', '').strip()
        gender = params.get('gender', '').strip()
        company = params.get('company', '').strip()

        if name:
            queryset = queryset.filter(name__icontains=name)

        if age and age.isdigit():
            queryset = queryset.filter(age=age)
        elif age:
            queryset = queryset.none()

        if gender:
            queryset = queryset.filter(gender__iexact=gender)

        if company:
            queryset = queryset.filter(company_details__company_name__icontains=company)

        return queryset.distinct()


    def perform_destroy(self, instance):
        # Soft delete: keep the record in the database and mark it as deleted.
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])

    def destroy(self, request, *args, **kwargs):
        user_detail = self.get_object()

        if user_detail.company_details.exists():
            return Response(
                {
                    'detail': (
                        'This user has company details. '
                        'Delete the company details before deleting the user.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.perform_destroy(user_detail)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'], url_path='undelete')
    def undelete(self, request, pk=None):
        # Custom ViewSet action for restoring a soft-deleted record.
        user_detail = get_object_or_404(UserDetail.deleted_objects, pk=pk)
        user_detail.is_deleted = False
        user_detail.save(update_fields=['is_deleted'])
        serializer = self.get_serializer(user_detail)
        return Response(serializer.data)


# A separate endpoint for company detail records. User responses still include
# company detail as a nested serializer.
class CompanyDetailViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyDetailSerializer
    pagination_class = DynamicPageNumberPagination
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'user_detail__name',
        'company_name',
        'role',
        'location',
    ]
    ordering_fields = [
        'id',
        'user_detail__name',
        'company_name',
        'role',
        'location',
    ]
    ordering = ['id']

    def get_queryset(self):
        queryset = CompanyDetail.objects.select_related('user_detail')
        params = self.request.query_params

        # Field-wise filters for company list API.
        user_detail = params.get('user_detail', '').strip()
        user_name = params.get('user_name', '').strip()
        company_name = params.get('company_name', '').strip()
        role = params.get('role', '').strip()
        location = params.get('location', '').strip()

        if user_detail and user_detail.isdigit():
            queryset = queryset.filter(user_detail_id=user_detail)
        elif user_detail:
            queryset = queryset.none()

        if user_name:
            queryset = queryset.filter(user_detail__name__icontains=user_name)

        if company_name:
            queryset = queryset.filter(company_name__icontains=company_name)

        if role:
            queryset = queryset.filter(role__icontains=role)

        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset


# Lightweight API for company form dropdown options.
class UserDropdownViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        UserDetail.active_objects.prefetch_related('company_details')
        .order_by('name')
    )
    serializer_class = UserDropdownSerializer
    pagination_class = None
