from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import CompanyDetail, UserDetail
from .pagination import DynamicPageNumberPagination
from .serializers import (
    CompanyDetailSerializer,
    UserDetailSerializer,
    UserDropdownSerializer,
)


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
        queryset = UserDetail.objects.prefetch_related(
            'company_details'
        ).filter(is_deleted=show_deleted)
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
        user_detail = get_object_or_404(UserDetail, pk=pk)
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
        UserDetail.objects.prefetch_related('company_details')
        .filter(is_deleted=False)
        .order_by('name')
    )
    serializer_class = UserDropdownSerializer
    pagination_class = None
