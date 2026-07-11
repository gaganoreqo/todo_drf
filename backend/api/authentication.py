from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from .jwt import decode_access_token
from .models import Account


class JWTAuthentication(BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = get_authorization_header(request).decode('utf-8')

        if not auth_header:
            return None

        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != self.keyword:
            raise AuthenticationFailed('Authorization header must be Bearer token.')

        try:
            payload = decode_access_token(parts[1])
        except ValueError as exc:
            raise AuthenticationFailed(str(exc)) from exc

        try:
            account = Account.objects.get(pk=payload['sub'], is_active=True)
        except Account.DoesNotExist as exc:
            raise AuthenticationFailed('Account is inactive or does not exist.') from exc

        return account, payload

    def authenticate_header(self, request):
        return self.keyword
