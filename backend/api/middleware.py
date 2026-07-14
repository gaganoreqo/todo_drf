import logging
from time import perf_counter


logger = logging.getLogger(__name__)


class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started_at = perf_counter()
        response = self.get_response(request)
        duration_ms = (perf_counter() - started_at) * 1000

        response['X-Request-Duration-ms'] = f'{duration_ms:.2f}'
        logger.info(
            '%s %s %s %.2fms',
            request.method,
            request.get_full_path(),
            response.status_code,
            duration_ms,
        )

        return response
