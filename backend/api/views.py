from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
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

    def get_queryset(self):
        # By default, show only active records.
        # Use /api/v1/user-details/?deleted=true to list soft-deleted records.
        show_deleted = self.request.query_params.get('deleted') == 'true'
        return (
            UserDetail.objects.prefetch_related('company_details')
            .filter(is_deleted=show_deleted)
            .order_by('id')
        )

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
    queryset = CompanyDetail.objects.select_related('user_detail').order_by('id')
    serializer_class = CompanyDetailSerializer
    pagination_class = DynamicPageNumberPagination


# Lightweight API for company form dropdown options.
class UserDropdownViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        UserDetail.objects.prefetch_related('company_details')
        .filter(is_deleted=False)
        .order_by('name')
    )
    serializer_class = UserDropdownSerializer
    pagination_class = None
