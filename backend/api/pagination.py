from rest_framework.pagination import PageNumberPagination


# Shared pagination for list APIs.
# The frontend sends ?page= and ?page_size= as query parameters.
class DynamicPageNumberPagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'page_size'
    max_page_size = 100
