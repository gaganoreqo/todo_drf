from rest_framework.permissions import BasePermission

from .models import Account


class IsAdminAccount(BasePermission):
    message = 'Admin account required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == Account.ROLE_ADMIN
        )
