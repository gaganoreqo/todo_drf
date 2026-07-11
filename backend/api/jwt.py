import base64
import hashlib
import hmac
import json
import time

from django.conf import settings


JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_LIFETIME_SECONDS = 60 * 60 * 8


def create_access_token(account, lifetime_seconds=ACCESS_TOKEN_LIFETIME_SECONDS):
    now = int(time.time())
    header = {
        'alg': JWT_ALGORITHM,
        'typ': 'JWT',
    }
    payload = {
        'sub': str(account.id),
        'email': account.email,
        'role': account.role,
        'iat': now,
        'exp': now + lifetime_seconds,
    }

    signing_input = '.'.join([
        _base64url_encode(header),
        _base64url_encode(payload),
    ])
    signature = _sign(signing_input)

    return f'{signing_input}.{signature}'


def decode_access_token(token):
    try:
        header_part, payload_part, signature = token.split('.')
    except ValueError as exc:
        raise ValueError('Token format is invalid.') from exc

    signing_input = f'{header_part}.{payload_part}'
    expected_signature = _sign(signing_input)

    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError('Token signature is invalid.')

    header = _base64url_decode_json(header_part)
    payload = _base64url_decode_json(payload_part)

    if header.get('alg') != JWT_ALGORITHM:
        raise ValueError('Token algorithm is not supported.')

    if int(payload.get('exp', 0)) < int(time.time()):
        raise ValueError('Token has expired.')

    if not payload.get('sub'):
        raise ValueError('Token subject is missing.')

    return payload


def _sign(signing_input):
    digest = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        signing_input.encode('utf-8'),
        hashlib.sha256,
    ).digest()
    return _base64url_encode_bytes(digest)


def _base64url_encode(data):
    return _base64url_encode_bytes(
        json.dumps(data, separators=(',', ':')).encode('utf-8')
    )


def _base64url_encode_bytes(data):
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def _base64url_decode_json(data):
    padding = '=' * (-len(data) % 4)

    try:
        decoded = base64.urlsafe_b64decode(f'{data}{padding}'.encode('utf-8'))
        return json.loads(decoded.decode('utf-8'))
    except (ValueError, json.JSONDecodeError) as exc:
        raise ValueError('Token payload is invalid.') from exc
