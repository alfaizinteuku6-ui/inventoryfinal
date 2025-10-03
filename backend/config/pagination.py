# pagination.py (create this file in your app)
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum limit