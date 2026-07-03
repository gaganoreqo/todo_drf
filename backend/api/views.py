from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import UserDetail
from .serializers import UserDetailSerializer


# A ModelViewSet provides list, retrieve, create, update, partial_update,
# and destroy actions for the UserDetail model.
class UserDetailViewSet(viewsets.ModelViewSet):
    serializer_class = UserDetailSerializer

    def get_queryset(self):
        # By default, show only active records.
        # Use /api/v1/user-details/?deleted=true to list soft-deleted records.
        show_deleted = self.request.query_params.get('deleted') == 'true'
        return UserDetail.objects.filter(is_deleted=show_deleted).order_by('id')

    def perform_destroy(self, instance):
        # Soft delete: keep the record in the database and mark it as deleted.
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])

    @action(detail=True, methods=['patch'], url_path='undelete')
    def undelete(self, request, pk=None):
        # Custom ViewSet action for restoring a soft-deleted record.
        user_detail = get_object_or_404(UserDetail, pk=pk)
        user_detail.is_deleted = False
        user_detail.save(update_fields=['is_deleted'])
        serializer = self.get_serializer(user_detail)
        return Response(serializer.data)
