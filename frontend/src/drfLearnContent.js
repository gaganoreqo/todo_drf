export const drfLearningTopics = [
  {
    id: 'basics',
    level: 'Basic',
    title: 'DRF, API, REST, JSON',
    goal: 'Understand why DRF exists and how a frontend talks to a Django backend.',
    terms: [
      {
        term: 'API',
        meaning: 'A contract that lets one application ask another application for data or actions.',
      },
      {
        term: 'REST',
        meaning: 'A URL and HTTP method based style for working with resources such as users or companies.',
      },
      {
        term: 'JSON',
        meaning: 'The common data format used by frontend apps and APIs.',
      },
      {
        term: 'Endpoint',
        meaning: 'One API URL, such as /api/v1/user-details/.',
      },
    ],
    flow: [
      'React sends an HTTP request.',
      'Django URL routes the request to a DRF view.',
      'The view reads or writes database data.',
      'A serializer converts model data to JSON.',
      'React receives JSON and updates the UI.',
    ],
    exampleTitle: 'Basic REST endpoint',
    exampleCode: `GET /api/v1/user-details/

Response:
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "name": "Anita",
      "age": 30,
      "gender": "Female"
    }
  ]
}`,
    interview: [
      {
        q: 'What is Django REST Framework?',
        a: 'DRF is a toolkit built on Django for creating Web APIs. It gives serializers, API views, authentication, permissions, pagination, routers, and a browsable API.',
      },
      {
        q: 'Why not use normal Django views for APIs?',
        a: 'Normal Django views can return JSON, but DRF gives a complete API layer with request parsing, validation, serialization, status codes, authentication, and reusable generic views.',
      },
    ],
  },
  {
    id: 'project-structure',
    level: 'Basic',
    title: 'Basic DRF Things and Project App Structure',
    goal: 'Understand the important DRF building blocks and where each file belongs in a Django project.',
    terms: [
      {
        term: 'Project',
        meaning: 'The Django configuration package that contains settings.py, root urls.py, asgi.py, and wsgi.py.',
      },
      {
        term: 'App',
        meaning: 'A focused Django module for one business area, such as api, users, products, or orders.',
      },
      {
        term: 'settings.py',
        meaning: 'Project configuration for installed apps, middleware, database, DRF settings, CORS, and schema tools.',
      },
      {
        term: 'App urls.py',
        meaning: 'The app-level URL file that maps API paths to views or DRF routers.',
      },
      {
        term: 'View',
        meaning: 'The request handler that chooses querysets, runs serializers, checks permissions, and returns responses.',
      },
    ],
    flow: [
      'manage.py runs Django commands for the project.',
      'Project settings.py loads apps, middleware, database, and REST_FRAMEWORK config.',
      'Project urls.py includes api.urls under a prefix such as /api/v1/.',
      'App models.py defines database tables.',
      'App serializers.py validates input and converts model data to JSON.',
      'App views.py handles API request logic.',
      'App urls.py registers ViewSets with a DRF router.',
    ],
    exampleTitle: 'Common DRF project tree',
    exampleCode: `backend/
  manage.py
  backend/
    settings.py
    urls.py
    asgi.py
    wsgi.py
  api/
    models.py
    serializers.py
    views.py
    urls.py
    permissions.py
    authentication.py
    pagination.py
    migrations/

# Request path:
# React -> /api/v1/user-details/ -> backend/urls.py
# -> api/urls.py -> UserDetailViewSet -> serializer -> model`,
    interview: [
      {
        q: 'What is the difference between a Django project and a Django app?',
        a: 'A project holds site-wide configuration. An app holds focused feature code such as models, serializers, views, urls, tests, and migrations.',
      },
      {
        q: 'Which files are most important in a basic DRF app?',
        a: 'models.py, serializers.py, views.py, urls.py, permissions.py, tests.py, and migrations are the files most beginners should understand first.',
      },
    ],
  },
  {
    id: 'models-serializers',
    level: 'Basic',
    title: 'Models, Migrations, Serializers',
    goal: 'Connect database tables to clean API input and output.',
    terms: [
      {
        term: 'Model',
        meaning: 'A Python class that represents a database table.',
      },
      {
        term: 'Migration',
        meaning: 'A generated file that applies model changes to the database.',
      },
      {
        term: 'Serializer',
        meaning: 'A DRF class that converts model objects to JSON and validates incoming JSON.',
      },
      {
        term: 'ModelSerializer',
        meaning: 'A serializer that creates fields automatically from a Django model.',
      },
    ],
    flow: [
      'Create the model fields.',
      'Run makemigrations and migrate.',
      'Create a ModelSerializer.',
      'Use the serializer in a view or ViewSet.',
    ],
    exampleTitle: 'ModelSerializer example',
    exampleCode: `from rest_framework import serializers
from .models import UserDetail


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetail
        fields = ["id", "name", "age", "gender"]`,
    interview: [
      {
        q: 'What does a serializer do?',
        a: 'It has two jobs: convert Python or model objects into JSON-ready data, and validate incoming JSON before saving it.',
      },
      {
        q: 'Serializer vs ModelSerializer?',
        a: 'Serializer requires fields to be written manually and is best for custom data. ModelSerializer reads model fields automatically and is best for model CRUD APIs.',
      },
    ],
  },
  {
    id: 'crud-router',
    level: 'Basic',
    title: 'CRUD, Routers, ModelViewSet',
    goal: 'Build complete create, read, update, and delete APIs with less repeated code.',
    terms: [
      {
        term: 'CRUD',
        meaning: 'Create, Read, Update, Delete.',
      },
      {
        term: 'Router',
        meaning: 'A DRF helper that generates list and detail URLs for ViewSets.',
      },
      {
        term: 'ModelViewSet',
        meaning: 'A ViewSet that includes list, retrieve, create, update, partial_update, and destroy.',
      },
    ],
    flow: [
      'Create a serializer.',
      'Create a ModelViewSet.',
      'Register it with DefaultRouter.',
      'Use generated URLs from the frontend.',
    ],
    exampleTitle: 'ModelViewSet plus router',
    exampleCode: `from rest_framework import viewsets
from rest_framework.routers import DefaultRouter


class UserDetailViewSet(viewsets.ModelViewSet):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer


router = DefaultRouter()
router.register("user-details", UserDetailViewSet, basename="user-detail")`,
    interview: [
      {
        q: 'Which actions does ModelViewSet provide?',
        a: 'list, retrieve, create, update, partial_update, and destroy.',
      },
      {
        q: 'Why use a router?',
        a: 'A router maps ViewSet actions to URLs automatically, reducing manual URL configuration.',
      },
    ],
  },
  {
    id: 'relationships',
    level: 'Intermediate',
    title: 'Relationships and Joined Data',
    goal: 'Represent one-to-one style business rules and return joined data in API responses.',
    terms: [
      {
        term: 'ForeignKey',
        meaning: 'A database relationship where one record points to another model.',
      },
      {
        term: 'related_name',
        meaning: 'The reverse lookup name from parent to child records.',
      },
      {
        term: 'select_related',
        meaning: 'Optimizes single-object relationships by using SQL joins.',
      },
      {
        term: 'prefetch_related',
        meaning: 'Optimizes reverse or many relationships by doing a second query and joining in Python.',
      },
    ],
    flow: [
      'CompanyDetail stores user_detail as a ForeignKey.',
      'The API can expose user_name from user_detail.name.',
      'Validation prevents duplicate company records for one user.',
      'select_related avoids extra user queries in company lists.',
    ],
    exampleTitle: 'Joined serializer field',
    exampleCode: `class CompanyDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user_detail.name", read_only=True)

    class Meta:
        model = CompanyDetail
        fields = ["id", "user_detail", "user_name", "company_name", "role"]`,
    interview: [
      {
        q: 'What is related_name used for?',
        a: 'It gives the reverse relationship a readable name, such as user.company_details instead of user.companydetail_set.',
      },
      {
        q: 'When do you use select_related?',
        a: 'Use it for ForeignKey or OneToOne relationships when you need related object fields in the same query.',
      },
    ],
  },
  {
    id: 'validation-nested',
    level: 'Intermediate',
    title: 'Validation, create(), update(), Nested Serializers',
    goal: 'Control business rules and safely save related records.',
    terms: [
      {
        term: 'validate_field',
        meaning: 'Field-level validation method, such as validate_name.',
      },
      {
        term: 'validate',
        meaning: 'Object-level validation that can compare multiple fields.',
      },
      {
        term: 'validated_data',
        meaning: 'Cleaned input data after serializer validation succeeds.',
      },
      {
        term: 'transaction.atomic',
        meaning: 'A database block that rolls back all writes if one write fails.',
      },
    ],
    flow: [
      'Serializer receives input data.',
      'Field validation checks each field.',
      'Object validation checks cross-field business rules.',
      'create() or update() saves data.',
      'transaction.atomic protects multi-table saves.',
    ],
    exampleTitle: 'Object-level validation',
    exampleCode: `def validate(self, attrs):
    if (
        self.instance
        and "user_detail" in attrs
        and attrs["user_detail"].id != self.instance.user_detail_id
    ):
        raise serializers.ValidationError({
            "user_detail": "Company details cannot be moved to another user."
        })

    return attrs`,
    interview: [
      {
        q: 'Field-level vs object-level validation?',
        a: 'Field-level validates one field at a time. Object-level validates rules that depend on multiple fields or the current instance.',
      },
      {
        q: 'Why use transaction.atomic with nested serializers?',
        a: 'If saving the child record fails, the parent save is rolled back so the database does not keep partial data.',
      },
    ],
  },
  {
    id: 'soft-delete',
    level: 'Intermediate',
    title: 'Soft Delete, Custom Managers, Actions',
    goal: 'Keep deleted records in the database while hiding them from active APIs.',
    terms: [
      {
        term: 'Soft delete',
        meaning: 'Marking a row as deleted instead of removing it from the database.',
      },
      {
        term: 'perform_destroy',
        meaning: 'DRF hook called by destroy before returning the delete response.',
      },
      {
        term: '@action',
        meaning: 'Adds a custom endpoint to a ViewSet.',
      },
      {
        term: 'Custom manager',
        meaning: 'Reusable query logic attached to the model, such as active_objects.',
      },
    ],
    flow: [
      'Add is_deleted to the model.',
      'Use active_objects for normal lists.',
      'Override perform_destroy to set is_deleted=True.',
      'Add an undelete action to restore records.',
    ],
    exampleTitle: 'Soft delete action',
    exampleCode: `def perform_destroy(self, instance):
    instance.is_deleted = True
    instance.save(update_fields=["is_deleted"])


@action(detail=True, methods=["patch"], url_path="undelete")
def undelete(self, request, pk=None):
    user = get_object_or_404(UserDetail.deleted_objects, pk=pk)
    user.is_deleted = False
    user.save(update_fields=["is_deleted"])
    return Response(self.get_serializer(user).data)`,
    interview: [
      {
        q: 'Why use soft delete?',
        a: 'It preserves audit/history data and allows restore workflows while keeping normal lists clean.',
      },
      {
        q: 'What is @action used for?',
        a: 'It adds custom ViewSet routes for behavior that does not fit standard CRUD, such as undelete.',
      },
    ],
  },
  {
    id: 'pagination-search',
    level: 'Intermediate',
    title: 'Pagination, Filtering, Search, Ordering',
    goal: 'Make list APIs scalable and easy to query from React.',
    terms: [
      {
        term: 'Pagination',
        meaning: 'Splitting large result sets into pages.',
      },
      {
        term: 'SearchFilter',
        meaning: 'DRF backend for global keyword search.',
      },
      {
        term: 'OrderingFilter',
        meaning: 'DRF backend for user-controlled sort order.',
      },
      {
        term: 'Query params',
        meaning: 'URL parameters such as ?page=2&ordering=-age.',
      },
    ],
    flow: [
      'Frontend sends page, page_size, search, filters, and ordering.',
      'DRF view filters the queryset.',
      'Pagination returns count, next, previous, and results.',
      'React renders table rows and page controls.',
    ],
    exampleTitle: 'Search and ordering setup',
    exampleCode: `class UserDetailViewSet(viewsets.ModelViewSet):
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "gender", "company_details__company_name"]
    ordering_fields = ["id", "name", "age", "gender"]
    ordering = ["id"]`,
    interview: [
      {
        q: 'What is the default paginated response shape?',
        a: 'It includes count, next, previous, and results.',
      },
      {
        q: 'Why use pagination?',
        a: 'It prevents returning too much data in one response and keeps the UI fast.',
      },
    ],
  },
  {
    id: 'frontend-integration',
    level: 'Intermediate',
    title: 'Frontend API Integration',
    goal: 'Connect React screens to DRF endpoints with clear URLs, headers, loading states, and error handling.',
    terms: [
      {
        term: 'API base URL',
        meaning: 'The shared root URL the frontend uses before endpoint paths, such as http://127.0.0.1:8000/api/v1/.',
      },
      {
        term: 'fetch',
        meaning: 'Browser API used by React code to send HTTP requests and receive responses.',
      },
      {
        term: 'Authorization header',
        meaning: 'Header used to send credentials such as Authorization: Bearer <access_token>.',
      },
      {
        term: 'Loading state',
        meaning: 'Frontend state that tells the UI a request is still running.',
      },
    ],
    flow: [
      'React builds the endpoint URL with query params.',
      'The request includes JSON headers and the JWT when required.',
      'DRF authenticates, validates, queries, and returns JSON.',
      'React checks response.ok before reading or rendering data.',
      'The UI updates loading, error, empty, and success states.',
    ],
    exampleTitle: 'React fetch request',
    exampleCode: `const response = await fetch(
  \`\${API_ROOT}user-details/?page=1&page_size=5\`,
  {
    headers: {
      Authorization: \`Bearer \${accessToken}\`,
      "Content-Type": "application/json",
    },
  },
)

if (!response.ok) {
  throw new Error("Unable to load users.")
}

const data = await response.json()`,
    interview: [
      {
        q: 'What should the frontend know about a DRF API?',
        a: 'It should know the endpoint URL, HTTP method, request payload, response shape, required headers, status codes, and error format.',
      },
      {
        q: 'Why use environment variables for API URLs?',
        a: 'They let the same frontend code call localhost in development and the production API after deployment.',
      },
    ],
  },
  {
    id: 'middleware',
    level: 'Intermediate',
    title: 'Django Middleware',
    goal: 'Understand code that runs around every request before and after the view.',
    terms: [
      {
        term: 'Middleware',
        meaning: 'A callable layer that receives the request, calls the next layer, and can inspect or change the response.',
      },
      {
        term: 'MIDDLEWARE setting',
        meaning: 'The ordered list of middleware classes Django applies to each request.',
      },
      {
        term: 'get_response',
        meaning: 'The next middleware or final view callable that continues request processing.',
      },
      {
        term: 'Response header',
        meaning: 'Metadata returned with a response, such as X-Request-Duration-ms.',
      },
    ],
    flow: [
      'Django receives the HTTP request.',
      'Middleware runs from top to bottom before the view.',
      'The view or DRF ViewSet creates a response.',
      'Middleware resumes from bottom to top after the view.',
      'The final response is sent back to React or the browser.',
    ],
    exampleTitle: 'Request timing middleware',
    exampleCode: `class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started_at = perf_counter()
        response = self.get_response(request)
        duration_ms = (perf_counter() - started_at) * 1000
        response["X-Request-Duration-ms"] = f"{duration_ms:.2f}"
        return response`,
    interview: [
      {
        q: 'What is Django middleware?',
        a: 'Middleware is code that runs around requests and responses, commonly used for security, sessions, CORS, authentication support, logging, and response headers.',
      },
      {
        q: 'Why does middleware order matter?',
        a: 'Middleware runs in order on the way in and reverse order on the way out, so one middleware can depend on changes made by another.',
      },
    ],
  },
  {
    id: 'abstract-models',
    level: 'Intermediate',
    title: 'Abstract Base Models',
    goal: 'Reuse common model fields without creating an extra database table.',
    terms: [
      {
        term: 'Abstract model',
        meaning: 'A Django model base class with shared fields and Meta abstract = True.',
      },
      {
        term: 'Concrete model',
        meaning: 'A normal model that gets its own database table.',
      },
      {
        term: 'Inherited field',
        meaning: 'A field declared on an abstract parent but stored on each child model table.',
      },
      {
        term: 'Timestamp fields',
        meaning: 'created_at and updated_at fields commonly shared by many models.',
      },
    ],
    flow: [
      'Create a base class that inherits models.Model.',
      'Put shared fields on the base class.',
      'Set class Meta: abstract = True.',
      'Make real models inherit from the base class.',
      'Run migrations so inherited fields exist on each real table.',
    ],
    exampleTitle: 'Timestamped abstract model',
    exampleCode: `class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserDetail(TimestampedModel):
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()`,
    interview: [
      {
        q: 'What does abstract = True do in Django models?',
        a: 'It tells Django not to create a table for the base class. Its fields are copied into each concrete child model.',
      },
      {
        q: 'When should you use an abstract base model?',
        a: 'Use it when several models need the same fields or methods, such as created_at, updated_at, ownership, or soft-delete flags.',
      },
    ],
  },
  {
    id: 'testing-docs',
    level: 'Intermediate',
    title: 'Testing and Swagger/OpenAPI',
    goal: 'Prove API behavior and document endpoints for frontend/backend collaboration.',
    terms: [
      {
        term: 'APITestCase',
        meaning: 'DRF test class with an API client for calling endpoints.',
      },
      {
        term: 'OpenAPI',
        meaning: 'A machine-readable API schema format.',
      },
      {
        term: 'Swagger UI',
        meaning: 'A browser UI generated from OpenAPI docs.',
      },
    ],
    flow: [
      'Write tests for CRUD success paths.',
      'Write tests for validation and permission failures.',
      'Generate OpenAPI schema.',
      'Use Swagger UI to inspect and test endpoints.',
    ],
    exampleTitle: 'API test example',
    exampleCode: `class UserDetailApiTests(APITestCase):
    def test_create_user(self):
        response = self.client.post("/api/v1/user-details/", {
            "name": "Rahul",
            "age": 25,
            "gender": "Male",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)`,
    interview: [
      {
        q: 'Why test APIs through APITestCase?',
        a: 'It tests the real request/response path, including routing, serializers, validation, permissions, and status codes.',
      },
      {
        q: 'What is Swagger useful for?',
        a: 'It gives a live API reference where developers can see payloads, responses, and available endpoints.',
      },
    ],
  },
  {
    id: 'authentication',
    level: 'Advanced',
    title: 'Authentication Types',
    goal: 'Understand how DRF identifies the user making an API request.',
    terms: [
      {
        term: 'Authentication',
        meaning: 'Identifying who is making the request.',
      },
      {
        term: 'BasicAuthentication',
        meaning: 'Uses a username and password encoded in the Authorization header.',
      },
      {
        term: 'SessionAuthentication',
        meaning: 'Uses Django sessions and cookies, usually for browser-based clients.',
      },
      {
        term: 'TokenAuthentication',
        meaning: 'Uses a stored token value sent by the client with each request.',
      },
      {
        term: 'JWT',
        meaning: 'Uses signed access tokens, commonly sent as Authorization: Bearer <token>.',
      },
    ],
    flow: [
      'Client sends credentials or an auth token.',
      'DRF authentication classes inspect the request.',
      'If valid, DRF sets request.user and request.auth.',
      'If invalid, DRF returns a 401 response or continues as anonymous depending on configuration.',
    ],
    exampleTitle: 'Authentication class examples',
    exampleCode: `REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

# Frontend JWT request:
# Authorization: Bearer <access_token>`,
    interview: [
      {
        q: 'What is authentication in DRF?',
        a: 'Authentication is the process of identifying the requester and setting request.user and request.auth.',
      },
      {
        q: 'Where should the frontend send a JWT?',
        a: 'In the Authorization header as Bearer <access_token>.',
      },
    ],
  },
  {
    id: 'permissions',
    level: 'Advanced',
    title: 'Permission Types',
    goal: 'Control what an authenticated or anonymous user can do in each API.',
    terms: [
      {
        term: 'Permission',
        meaning: 'A rule that decides whether a request is allowed.',
      },
      {
        term: 'AllowAny',
        meaning: 'Allows all users, authenticated or anonymous.',
      },
      {
        term: 'IsAuthenticated',
        meaning: 'Allows only logged-in users.',
      },
      {
        term: 'IsAdminUser',
        meaning: 'Allows only Django staff/admin users.',
      },
      {
        term: 'Object permission',
        meaning: 'A rule checked against one specific object using has_object_permission.',
      },
    ],
    flow: [
      'Authentication identifies the requester.',
      'Permission classes run after authentication.',
      'has_permission checks general endpoint access.',
      'has_object_permission checks access to a specific record.',
      'DRF returns 403 if the user is authenticated but not allowed.',
    ],
    exampleTitle: 'Permission class examples',
    exampleCode: `from rest_framework.permissions import BasePermission


class IsAdminAccount(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )`,
    interview: [
      {
        q: 'What is permission in DRF?',
        a: 'Permission is the access-control step that decides whether a request can use an endpoint or object.',
      },
      {
        q: 'Authentication vs permission?',
        a: 'Authentication answers who the requester is. Permission answers whether that requester is allowed.',
      },
    ],
  },
  {
    id: 'advanced',
    level: 'Advanced',
    title: 'Production, Performance, Advanced API Topics',
    goal: 'Prepare DRF apps for real users and production environments.',
    terms: [
      {
        term: 'DEBUG=False',
        meaning: 'Production mode that hides debug details and uses stricter settings.',
      },
      {
        term: 'N+1 query',
        meaning: 'A performance bug where each row triggers extra database queries.',
      },
      {
        term: 'Throttling',
        meaning: 'Rate limiting API requests.',
      },
      {
        term: 'Custom exception handler',
        meaning: 'A central function that formats API errors consistently.',
      },
    ],
    flow: [
      'Move secrets to environment variables.',
      'Use PostgreSQL for production.',
      'Optimize related queries with select_related and prefetch_related.',
      'Add caching or throttling where traffic requires it.',
      'Use Docker, CI/CD, Gunicorn, Nginx, HTTPS, and monitoring for deployment.',
    ],
    exampleTitle: 'Query optimization example',
    exampleCode: `class CompanyDetailViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return CompanyDetail.objects.select_related("user_detail")`,
    interview: [
      {
        q: 'How do you avoid N+1 queries?',
        a: 'Use select_related for ForeignKey/OneToOne relationships and prefetch_related for reverse or many relationships.',
      },
      {
        q: 'What settings matter most in production?',
        a: 'DEBUG=False, secure SECRET_KEY management, ALLOWED_HOSTS, database configuration, CORS, HTTPS, static files, logs, and monitoring.',
      },
    ],
  },
]

export const drfViewStyles = [
  {
    id: 'fbv',
    title: 'Function Based View',
    shortName: 'FBV',
    summary: 'A plain function view decorated with @api_view.',
    bestFor: 'Tiny endpoints, custom one-off APIs, learning request/response basics.',
    methods: 'You manually branch on HTTP methods or create separate functions.',
    exampleCode: `from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET", "POST"])
def user_list(request):
    if request.method == "GET":
        users = UserDetail.objects.all()
        serializer = UserDetailSerializer(users, many=True)
        return Response(serializer.data)

    serializer = UserDetailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=201)`,
    pros: [
      'Simple to read for beginners.',
      'Good for custom logic with only one or two methods.',
      'Less abstraction.',
    ],
    cons: [
      'Repeated code grows quickly.',
      'Harder to reuse common behavior.',
      'Manual method handling can become messy.',
    ],
    interview: {
      q: 'When should you use FBV in DRF?',
      a: 'Use FBV for small custom endpoints where generic CRUD abstraction would be unnecessary.',
    },
  },
  {
    id: 'apiview',
    title: 'Class Based View / APIView',
    shortName: 'CBV',
    summary: 'A class-based DRF view where each HTTP method is a class method.',
    bestFor: 'Custom APIs that need class organization, permissions, authentication, or shared helpers.',
    methods: 'Define get(), post(), put(), patch(), delete() methods yourself.',
    exampleCode: `from rest_framework.views import APIView
from rest_framework.response import Response


class UserListAPIView(APIView):
    def get(self, request):
        users = UserDetail.objects.all()
        serializer = UserDetailSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)`,
    pros: [
      'Cleaner than large function views.',
      'Easy to attach authentication and permission classes.',
      'Good control over every method.',
    ],
    cons: [
      'Still repeats common list/create/update/delete logic.',
      'No automatic queryset/serializer behavior.',
      'More code than generics for model CRUD.',
    ],
    interview: {
      q: 'APIView vs normal Django View?',
      a: 'APIView adds DRF request parsing, Response handling, authentication, permissions, throttling, and API exceptions.',
    },
  },
  {
    id: 'generic-apiview',
    title: 'GenericAPIView',
    shortName: 'GenericAPIView',
    summary: 'A DRF base class that gives queryset, serializer, lookup, filtering, and pagination helpers without adding CRUD actions by itself.',
    bestFor: 'When you want get_queryset(), get_serializer(), and get_object() helpers but still want to write each HTTP method manually.',
    methods: 'Define get(), post(), put(), patch(), and delete() yourself, then call GenericAPIView helpers inside them.',
    exampleCode: `from rest_framework import generics, status
from rest_framework.response import Response


class UserListCreateGenericAPIView(generics.GenericAPIView):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    def get(self, request):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)`,
    pros: [
      'Gives reusable helpers without forcing a concrete CRUD pattern.',
      'Cleaner than APIView for model-backed endpoints.',
      'Good bridge before learning mixins and concrete generic views.',
    ],
    cons: [
      'Does not implement list, create, retrieve, update, or destroy automatically.',
      'More manual code than mixins or concrete generic views.',
      'Easy to confuse with ListCreateAPIView or RetrieveUpdateDestroyAPIView.',
    ],
    interview: {
      q: 'What does GenericAPIView provide?',
      a: 'GenericAPIView provides queryset and serializer helpers such as get_queryset(), get_serializer(), get_object(), filtering, pagination helpers, and lookup support. It does not provide CRUD actions unless you add mixins or write methods manually.',
    },
  },
  {
    id: 'mixins',
    title: 'GenericAPIView with Mixins',
    shortName: 'Mixins',
    summary: 'Reusable CRUD behavior combined with GenericAPIView.',
    bestFor: 'When you want selected CRUD actions but not the full concrete generic class.',
    methods: 'Map HTTP methods to mixin actions like list(), create(), retrieve(), update(), destroy().',
    exampleCode: `from rest_framework import generics, mixins


class UserListCreateView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    def get(self, request):
        return self.list(request)

    def post(self, request):
        return self.create(request)`,
    pros: [
      'Reusable CRUD pieces.',
      'More explicit than concrete generics.',
      'Good when you need uncommon combinations.',
    ],
    cons: [
      'More verbose than concrete generic views.',
      'Method-to-mixin mapping must be written manually.',
      'Can be confusing before learning DRF internals.',
    ],
    interview: {
      q: 'What do mixins provide?',
      a: 'They provide reusable action methods such as list, create, retrieve, update, partial_update, and destroy.',
    },
  },
  {
    id: 'generics',
    title: 'Concrete Generic Views',
    shortName: 'Generics',
    summary: 'Ready-made class views such as ListCreateAPIView and RetrieveUpdateDestroyAPIView.',
    bestFor: 'Standard model APIs where URL patterns are still manually declared.',
    methods: 'The class already maps HTTP methods to actions.',
    exampleCode: `from rest_framework import generics


class UserListCreateView(generics.ListCreateAPIView):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer`,
    pros: [
      'Very fast for common CRUD endpoints.',
      'Less repeated code than APIView or mixins.',
      'Still clear which URL maps to which class.',
    ],
    cons: [
      'Less flexible when one class needs many custom actions.',
      'Manual URL configuration is still needed.',
      'Can hide behavior from beginners.',
    ],
    interview: {
      q: 'Generics vs APIView?',
      a: 'Generics include common CRUD behavior. APIView gives lower-level control but requires more manual code.',
    },
  },
  {
    id: 'viewsets',
    title: 'ViewSet',
    shortName: 'ViewSet',
    summary: 'Groups related actions into one class and works with routers.',
    bestFor: 'APIs where list/detail/custom actions should live together and router URLs are useful.',
    methods: 'Define action methods such as list(), retrieve(), create(), plus custom @action methods.',
    exampleCode: `from rest_framework import viewsets
from rest_framework.response import Response


class UserStatsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({
            "active_users": UserDetail.active_objects.count()
        })`,
    pros: [
      'Router support.',
      'Groups related actions in one class.',
      'Good for custom resources that are not simple model CRUD.',
    ],
    cons: [
      'Does not automatically provide model CRUD unless using mixins or ModelViewSet.',
      'Router/action mapping is less obvious at first.',
      'Can be overkill for one tiny endpoint.',
    ],
    interview: {
      q: 'What is the main benefit of ViewSet?',
      a: 'It groups related API actions and lets routers generate URLs automatically.',
    },
  },
  {
    id: 'model-viewsets',
    title: 'ModelViewSet',
    shortName: 'ModelViewSet',
    summary: 'The highest-level DRF shortcut for full model CRUD with router support.',
    bestFor: 'Most standard database CRUD APIs, like user-details and company-details.',
    methods: 'Includes list, retrieve, create, update, partial_update, and destroy.',
    exampleCode: `from rest_framework import viewsets


class UserDetailViewSet(viewsets.ModelViewSet):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer`,
    pros: [
      'Minimal code for complete CRUD.',
      'Works cleanly with routers.',
      'Supports filters, pagination, permissions, and custom actions.',
    ],
    cons: [
      'Too broad if the API should expose only one or two actions.',
      'Needs careful permission control.',
      'Can hide too much behavior for very custom workflows.',
    ],
    interview: {
      q: 'When should you avoid ModelViewSet?',
      a: 'Avoid it when the endpoint is not normal CRUD, when only a very small action is needed, or when each method needs very different custom behavior.',
    },
  },
]

export const drfComparisonRows = [
  {
    name: 'FBV',
    abstraction: 'Lowest',
    urls: 'Manual path()',
    crud: 'Manual',
    bestUse: 'Small custom endpoint',
  },
  {
    name: 'APIView',
    abstraction: 'Low',
    urls: 'Manual path()',
    crud: 'Manual',
    bestUse: 'Custom class-based API',
  },
  {
    name: 'GenericAPIView',
    abstraction: 'Low-medium',
    urls: 'Manual path()',
    crud: 'Manual with generic helpers',
    bestUse: 'Custom model API with serializer/queryset helpers',
  },
  {
    name: 'Mixins',
    abstraction: 'Medium',
    urls: 'Manual path()',
    crud: 'Selected reusable actions',
    bestUse: 'Custom CRUD combinations',
  },
  {
    name: 'Generics',
    abstraction: 'High',
    urls: 'Manual path()',
    crud: 'Built in for common patterns',
    bestUse: 'List/create or detail/update/delete APIs',
  },
  {
    name: 'ViewSet',
    abstraction: 'High',
    urls: 'Router',
    crud: 'Manual unless mixed in',
    bestUse: 'Grouped custom actions',
  },
  {
    name: 'ModelViewSet',
    abstraction: 'Highest',
    urls: 'Router',
    crud: 'Full CRUD built in',
    bestUse: 'Standard model CRUD',
  },
]

export const drfTopicDeepDives = {
  basics: [
    {
      title: 'Why DRF exists',
      body: 'Django is excellent for server-rendered websites, but API clients usually need JSON instead of HTML. DRF adds an API layer on top of Django so React, mobile apps, and external services can safely read and write data.',
    },
    {
      title: 'Resource thinking',
      body: 'In REST, every important thing is treated as a resource. In this project, users and company details are resources, so they get predictable URLs like /api/v1/user-details/ and /api/v1/company-details/.',
    },
    {
      title: 'HTTP method meaning',
      body: 'GET should only read data, POST creates new data, PUT replaces a whole record, PATCH updates part of a record, and DELETE removes or soft-deletes a record. Interviewers often check whether you understand these method responsibilities.',
    },
    {
      title: 'Frontend and backend contract',
      body: 'The frontend should not know database details. It should know only the API contract: URL, method, request payload, response shape, and possible errors.',
    },
  ],
  'project-structure': [
    {
      title: 'Project files configure the whole backend',
      body: 'The backend package contains global configuration. settings.py controls installed apps, middleware, database, CORS, DRF defaults, and documentation settings. The root urls.py decides which app URL files are mounted.',
    },
    {
      title: 'App files hold feature code',
      body: 'The api app contains the actual business API code. models.py stores database structure, serializers.py stores API input/output rules, views.py handles requests, and urls.py exposes routes.',
    },
    {
      title: 'DRF adds API-specific layers',
      body: 'Django gives models, URLs, settings, middleware, and migrations. DRF adds serializers, APIView, ViewSets, routers, permissions, authentication classes, pagination, filters, and Response.',
    },
    {
      title: 'The request path should be traceable',
      body: 'For any endpoint, you should be able to follow the path from frontend fetch URL, to project urls.py, to app urls.py, to view, to serializer, to model, and back as JSON.',
    },
  ],
  'models-serializers': [
    {
      title: 'Model is the database source',
      body: 'A model defines the real stored fields. If UserDetail has name, age, gender, and is_deleted, then serializers and views should respect that structure unless they intentionally expose a different API shape.',
    },
    {
      title: 'Serializer is not only output',
      body: 'A common beginner mistake is thinking serializers only convert model data to JSON. They also validate incoming JSON, convert it to Python values, and call create() or update() when serializer.save() runs.',
    },
    {
      title: 'ModelSerializer saves repeated code',
      body: 'ModelSerializer reads fields from the model and creates matching serializer fields. You still customize it when you need read-only fields, nested data, custom validation, or custom save behavior.',
    },
    {
      title: 'Validation belongs near the API boundary',
      body: 'Serializer validation is the right place to reject bad API input before it touches the database. This keeps frontend errors consistent and keeps view code smaller.',
    },
  ],
  'crud-router': [
    {
      title: 'CRUD maps to predictable actions',
      body: 'A standard CRUD API needs list, retrieve, create, update, partial_update, and destroy. ModelViewSet gives these actions automatically when queryset and serializer_class are provided.',
    },
    {
      title: 'Router creates URL patterns',
      body: 'DefaultRouter connects list actions to /resource/ and detail actions to /resource/{id}/. This is why ModelViewSet pairs naturally with routers.',
    },
    {
      title: 'Use hooks instead of rewriting everything',
      body: 'For small changes, override get_queryset(), perform_create(), perform_update(), or perform_destroy(). Only rewrite create() or update() when you need to change request/response flow.',
    },
    {
      title: 'CRUD still needs permissions',
      body: 'ModelViewSet exposes many operations. In real projects, always pair it with permissions so users cannot update or delete records they should not control.',
    },
  ],
  relationships: [
    {
      title: 'ForeignKey stores ownership or association',
      body: 'CompanyDetail uses a ForeignKey to UserDetail. That means the company row stores the user id, and Django can navigate from company to user and from user to related companies.',
    },
    {
      title: 'Reverse relation matters',
      body: 'related_name="company_details" gives user.company_details. Without related_name, Django creates a less readable default like companydetail_set.',
    },
    {
      title: 'Joined fields improve frontend data',
      body: 'The company API returns user_name so the frontend can show company rows without making a second API request for each user.',
    },
    {
      title: 'Query optimization prevents slow pages',
      body: 'If a list endpoint shows related object data, use select_related or prefetch_related. Otherwise, each row can trigger extra queries and the page becomes slower as data grows.',
    },
  ],
  'validation-nested': [
    {
      title: 'Validation order',
      body: 'DRF first parses input, then validates fields, then runs object-level validate(), and only after that does serializer.save() call create() or update().',
    },
    {
      title: 'Field validation is narrow',
      body: 'Use validate_name() or validate_role() when one field alone decides whether the value is valid, such as trimming text or rejecting duplicate names.',
    },
    {
      title: 'Object validation handles business rules',
      body: 'Use validate(self, attrs) when the rule depends on multiple fields or the current instance, such as preventing company details from moving to a different user.',
    },
    {
      title: 'Nested writes need transaction safety',
      body: 'When one request writes both parent and child records, transaction.atomic makes sure either all records are saved or none are saved.',
    },
  ],
  'soft-delete': [
    {
      title: 'Soft delete keeps history',
      body: 'Instead of physically deleting the row, soft delete marks is_deleted=True. This allows restore features and protects historical references.',
    },
    {
      title: 'Managers keep query code clean',
      body: 'active_objects and deleted_objects avoid repeating is_deleted filters across every view. They also make code easier to read in tests and serializers.',
    },
    {
      title: 'Destroy can be customized',
      body: 'perform_destroy() is the clean hook when delete behavior changes but the request/response shape can stay standard.',
    },
    {
      title: 'Custom actions extend CRUD',
      body: 'Undelete is not normal CRUD, so @action creates a clear custom endpoint while keeping the behavior inside the ViewSet.',
    },
  ],
  'pagination-search': [
    {
      title: 'Pagination protects performance',
      body: 'Returning all rows works in small demos but breaks with large data. Pagination lets the frontend request only the current page.',
    },
    {
      title: 'Search is broad',
      body: 'SearchFilter checks a keyword against configured search_fields. It is useful for global search boxes.',
    },
    {
      title: 'Field filters are precise',
      body: 'Manual query param filters like gender=Female or age=25 are better when the UI has exact filter controls.',
    },
    {
      title: 'Ordering must be controlled',
      body: 'Only expose safe ordering_fields. This prevents clients from sorting on fields that are slow, private, or not intended for API use.',
    },
  ],
  'frontend-integration': [
    {
      title: 'The frontend depends on contracts',
      body: 'React should not depend on model internals. It should depend on stable API contracts: URLs, methods, payload fields, response fields, and error shapes.',
    },
    {
      title: 'Headers carry API context',
      body: 'JSON requests usually send Content-Type and Accept headers. Protected endpoints also need Authorization so DRF can authenticate the requester.',
    },
    {
      title: 'Query params power list screens',
      body: 'Pagination, search, filters, and ordering are easiest to maintain when the frontend stores them as state and converts them into URL query params.',
    },
    {
      title: 'Errors are part of the UI',
      body: 'A production frontend should handle loading, empty, validation, unauthorized, forbidden, and server-error states instead of assuming every request succeeds.',
    },
  ],
  middleware: [
    {
      title: 'Middleware wraps the view',
      body: 'Django calls middleware before the view and then resumes it after the response exists. That makes middleware useful for cross-cutting behavior that should apply to many endpoints.',
    },
    {
      title: 'Order changes behavior',
      body: 'SecurityMiddleware, CORS middleware, session middleware, common middleware, CSRF middleware, authentication middleware, and custom middleware all run in the order listed in settings.py.',
    },
    {
      title: 'Good middleware stays focused',
      body: 'Middleware should handle request-wide concerns such as headers, logging, request IDs, timing, locale, or security checks. Endpoint business logic belongs in views, serializers, services, or permissions.',
    },
    {
      title: 'Response headers help frontend debugging',
      body: 'A timing header such as X-Request-Duration-ms lets frontend developers inspect backend response time directly in the browser network panel.',
    },
  ],
  'abstract-models': [
    {
      title: 'Abstract means no parent table',
      body: 'With abstract = True, Django does not create a table for the base class. Each child model gets its own copy of the inherited fields.',
    },
    {
      title: 'Best for repeated fields',
      body: 'created_at, updated_at, owner, status, and soft-delete flags are common candidates when several models need the same columns and behavior.',
    },
    {
      title: 'Migrations still matter',
      body: 'Adding a field to an abstract base model can change every concrete child table. Always review migrations because one small base-class change can affect many tables.',
    },
    {
      title: 'Different from multi-table inheritance',
      body: 'Abstract models copy fields into child tables. Multi-table inheritance creates a parent table and joins it to child tables, which is a different database shape.',
    },
  ],
  'testing-docs': [
    {
      title: 'Tests protect behavior',
      body: 'API tests verify status codes, response data, database writes, validation errors, permissions, and edge cases such as soft delete restore.',
    },
    {
      title: 'Test the public API',
      body: 'APITestCase calls endpoints like a real client. This is better than only testing serializer methods because it includes routing, views, permissions, and serialization together.',
    },
    {
      title: 'Swagger helps collaboration',
      body: 'OpenAPI docs show frontend developers what endpoints exist, what payloads are expected, and what response shape comes back.',
    },
    {
      title: 'Docs do not replace tests',
      body: 'Swagger explains the API, but tests prove the API works. Good DRF projects use both.',
    },
  ],
  authentication: [
    {
      title: 'Authentication happens first',
      body: 'DRF runs authentication classes before permission classes. If credentials are valid, DRF sets request.user and request.auth for the rest of the request.',
    },
    {
      title: 'BasicAuthentication',
      body: 'Basic auth sends username and password in the Authorization header. It is simple for testing, but it should be used only over HTTPS and is less common for modern browser apps.',
    },
    {
      title: 'SessionAuthentication',
      body: 'Session auth uses Django sessions and cookies. It is useful for server-rendered pages and the browsable API, but browser clients must handle CSRF correctly.',
    },
    {
      title: 'Token and JWT authentication',
      body: 'Token auth stores one token in the database. JWT auth uses signed access tokens and often refresh tokens, making it common for React/mobile apps.',
    },
  ],
  permissions: [
    {
      title: 'Permissions happen after authentication',
      body: 'After DRF knows who made the request, permission classes decide whether that user can access the view or object.',
    },
    {
      title: 'Built-in permission classes',
      body: 'AllowAny opens an endpoint, IsAuthenticated requires login, IsAdminUser requires staff/admin users, and IsAuthenticatedOrReadOnly allows public reads but protects writes.',
    },
    {
      title: 'Model and object permissions',
      body: 'DjangoModelPermissions connects API access to Django add/change/delete/view permissions. Object permissions check access for one specific record.',
    },
    {
      title: 'Custom permissions',
      body: 'Custom permissions use BasePermission when business rules are project-specific, such as allowing only admin accounts to manage users.',
    },
  ],
  advanced: [
    {
      title: 'Production settings are different',
      body: 'Development settings are convenient, but production needs DEBUG=False, strict ALLOWED_HOSTS, secure secret handling, HTTPS, real database configuration, and logging.',
    },
    {
      title: 'Performance starts with query count',
      body: 'Before adding cache, check how many SQL queries an endpoint runs. Many slow DRF APIs are caused by N+1 related-object queries.',
    },
    {
      title: 'Caching and throttling solve different problems',
      body: 'Caching reduces repeated expensive work. Throttling protects the API from too many requests by one client.',
    },
    {
      title: 'Deployment is part of backend engineering',
      body: 'A production DRF app usually needs Gunicorn, Nginx, HTTPS, static/media handling, environment variables, monitoring, and automated tests in CI.',
    },
  ],
}

export const drfTopicSupplements = {
  basics: {
    mustKnow: [
      'API means a contract between client and server, not only a URL.',
      'REST uses resources, URLs, HTTP methods, status codes, and representations.',
      'Safe methods like GET should not change server data.',
      'Request body, query params, headers, and status codes are separate parts of an API request.',
      'A frontend should depend on API contracts, not database internals.',
    ],
    mistakes: [
      'Using GET to create or delete data.',
      'Returning inconsistent response shapes from similar endpoints.',
      'Ignoring status codes and checking only response text.',
      'Mixing frontend display names with backend database field names without a clear serializer contract.',
    ],
    practiceTitle: 'Request anatomy example',
    practiceCode: `GET /api/v1/user-details/?page=1&ordering=-id HTTP/1.1
Authorization: Bearer <access_token>
Accept: application/json

# URL path: /api/v1/user-details/
# Query params: page=1, ordering=-id
# Header: Authorization
# Body: none for GET`,
  },
  'project-structure': {
    mustKnow: [
      'A Django project is configuration; a Django app is feature code.',
      'Add local and third-party apps to INSTALLED_APPS before using them.',
      'Project urls.py usually includes app urls.py under a versioned API prefix.',
      'Serializers are the API boundary between request data and model data.',
      'Routers generate standard ViewSet URLs automatically.',
      'Tests should call API endpoints, not only individual helper methods.',
    ],
    mistakes: [
      'Putting all code into project settings or root urls.py instead of app files.',
      'Creating serializers before the model fields are clear.',
      'Forgetting to include app urls.py in the project urls.py.',
      'Editing models.py and forgetting makemigrations and migrate.',
      'Confusing app-level urls.py with project-level urls.py.',
    ],
    practiceTitle: 'Minimal DRF setup path',
    practiceCode: `# backend/settings.py
INSTALLED_APPS = [
    "rest_framework",
    "api",
]

# backend/urls.py
urlpatterns = [
    path("api/v1/", include("api.urls")),
]

# api/urls.py
router = DefaultRouter()
router.register("user-details", UserDetailViewSet, basename="user-detail")

urlpatterns = [
    path("", include(router.urls)),
]`,
  },
  'models-serializers': {
    mustKnow: [
      'Model fields define database storage; serializer fields define API input and output.',
      'null=True affects the database. blank=True affects validation/forms.',
      'A serializer can expose fields that do not exist directly as model columns.',
      'read_only_fields protects fields from input changes.',
      'write_only=True is useful for sensitive input such as password.',
    ],
    mistakes: [
      'Thinking model validation and serializer validation are always the same.',
      'Putting API-only response formatting into models instead of serializers.',
      'Forgetting max_length on CharField.',
      'Allowing sensitive fields to appear in serializer output.',
    ],
    practiceTitle: 'Model field vs serializer field',
    practiceCode: `class Account(models.Model):
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)


class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = ["id", "email", "password"]`,
  },
  'crud-router': {
    mustKnow: [
      'ModelViewSet is best when the endpoint is truly normal CRUD.',
      'Routers generate list and detail routes automatically.',
      'Use perform_create, perform_update, and perform_destroy for small save/delete customizations.',
      'Use @action for non-CRUD behavior such as undelete or export.',
      'Permissions matter because ModelViewSet exposes every CRUD operation.',
    ],
    mistakes: [
      'Using ModelViewSet for a single custom report endpoint.',
      'Overriding create() when perform_create() is enough.',
      'Registering a ViewSet without basename when DRF cannot infer one.',
      'Forgetting to restrict DELETE or update operations.',
    ],
    practiceTitle: 'Custom action example',
    practiceCode: `class UserDetailViewSet(viewsets.ModelViewSet):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    @action(detail=True, methods=["patch"])
    def archive(self, request, pk=None):
        user = self.get_object()
        user.is_deleted = True
        user.save(update_fields=["is_deleted"])
        return Response(self.get_serializer(user).data)`,
  },
  relationships: {
    mustKnow: [
      'ForeignKey is many-to-one; OneToOneField is one-to-one; ManyToManyField is many-to-many.',
      'related_name controls reverse access from parent to child.',
      'on_delete controls what happens when the parent object is deleted.',
      'select_related is for single related objects; prefetch_related is for many/reverse relations.',
      'Database constraints protect rules even if validation is missed.',
    ],
    mistakes: [
      'Using ForeignKey when OneToOneField is the real business rule.',
      'Forgetting related_name and ending up with unclear reverse names.',
      'Causing N+1 queries by reading related fields in a loop.',
      'Relying only on frontend checks for relationship constraints.',
    ],
    practiceTitle: 'Relationship delete behaviors',
    practiceCode: `class Invoice(models.Model):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="invoices",
    )

# CASCADE deletes child rows.
# PROTECT prevents deleting the parent.
# SET_NULL keeps child row and clears the relation. Requires null=True.`,
  },
  'validation-nested': {
    mustKnow: [
      'Always call is_valid() before save().',
      'validated_data is trusted input after validation, not raw request data.',
      'partial=True is required for PATCH-style partial updates.',
      'Nested writes need explicit create/update logic.',
      'Use transaction.atomic when one API request writes multiple related tables.',
    ],
    mistakes: [
      'Using request.data directly inside model create logic.',
      'Forgetting partial=True in PATCH handlers.',
      'Returning generic validation errors that the frontend cannot display clearly.',
      'Saving parent data before child validation without transaction safety.',
    ],
    practiceTitle: 'Validation flow example',
    practiceCode: `serializer = CompanyDetailSerializer(instance, data=request.data, partial=True)
serializer.is_valid(raise_exception=True)
company = serializer.save()

# request.data      -> raw input
# validated_data    -> cleaned input
# serializer.data   -> output representation`,
  },
  'soft-delete': {
    mustKnow: [
      'Soft delete is a product decision, not only a code pattern.',
      'Normal APIs should hide deleted rows by default.',
      'Deleted rows often need separate permissions.',
      'Hard delete may still be needed for cleanup jobs or privacy requirements.',
      'Unique constraints can be tricky with soft-deleted rows.',
    ],
    mistakes: [
      'Forgetting to filter deleted rows from list APIs.',
      'Allowing restore without checking permissions.',
      'Soft-deleting parent records while child records still depend on them.',
      'Assuming unique fields can be reused automatically after soft delete.',
    ],
    practiceTitle: 'Manager pattern example',
    practiceCode: `class UserDetailQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)


class UserDetail(models.Model):
    objects = UserDetailQuerySet.as_manager()
    active_objects = ActiveUserDetailManager()`,
  },
  'pagination-search': {
    mustKnow: [
      'Pagination, filtering, searching, and ordering should be applied at queryset level.',
      'SearchFilter is broad; field filters are exact or field-specific.',
      'Ordering should be limited to allowed fields.',
      'Indexes help frequently filtered or ordered database fields.',
      'Debounce frontend search inputs to reduce API load.',
    ],
    mistakes: [
      'Filtering in Python after loading all rows.',
      'Allowing ordering on every model field without thinking about performance.',
      'Returning huge unpaginated lists to React.',
      'Treating invalid filter values as valid database input.',
    ],
    practiceTitle: 'Query param contract example',
    practiceCode: `GET /api/v1/company-details/?page=2&page_size=10&search=Apple&ordering=-company_name

Response:
{
  "count": 31,
  "next": "...page=3",
  "previous": "...page=1",
  "results": []
}`,
  },
  'frontend-integration': {
    mustKnow: [
      'Keep the API base URL configurable.',
      'Always check response.ok before trusting the response body.',
      'Send Authorization headers only to APIs that should receive the token.',
      'Represent loading, error, empty, and success states separately.',
      'Keep frontend field names aligned with serializer field names.',
    ],
    mistakes: [
      'Hardcoding localhost API URLs into deployed frontend code.',
      'Ignoring 401 and 403 responses and showing a generic error.',
      'Duplicating backend validation rules only in React.',
      'Refetching every row individually when one list endpoint can return joined data.',
    ],
    practiceTitle: 'List URL builder example',
    practiceCode: `function buildUserUrl(page, pageSize, filters) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (filters.search) {
    params.set("search", filters.search)
  }

  return \`\${API_ROOT}user-details/?\${params.toString()}\`
}`,
  },
  middleware: {
    mustKnow: [
      'Middleware is configured in the MIDDLEWARE list in settings.py.',
      'Request middleware order is top to bottom.',
      'Response middleware order is bottom to top.',
      'Middleware is for app-wide request/response concerns.',
      'Small headers can make backend behavior easier to inspect from the frontend.',
    ],
    mistakes: [
      'Putting endpoint-specific business rules in middleware.',
      'Adding database-heavy logic to every request.',
      'Placing CORS middleware too late in the middleware list.',
      'Forgetting that exceptions can skip normal response logic if not handled.',
    ],
    practiceTitle: 'Register custom middleware',
    practiceCode: `MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "api.middleware.RequestTimingMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
]`,
  },
  'abstract-models': {
    mustKnow: [
      'abstract = True prevents a database table for the base model.',
      'Inherited fields are created on each concrete child model table.',
      'Changing an abstract base model can create migrations for many child models.',
      'Abstract models are good for repeated fields and simple shared methods.',
      'Do not use abstract inheritance when the base record must be queried directly.',
    ],
    mistakes: [
      'Forgetting class Meta: abstract = True and accidentally creating a table.',
      'Adding too many unrelated fields to one shared base model.',
      'Changing the base model without reviewing every generated migration.',
      'Expecting abstract models to support querying the parent class.',
    ],
    practiceTitle: 'Shared timestamp model',
    practiceCode: `class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CompanyDetail(TimestampedModel):
    company_name = models.CharField(max_length=255)`,
  },
  'testing-docs': {
    mustKnow: [
      'Test success and failure paths.',
      'Test database state after write requests.',
      'Test permissions, authentication, filtering, pagination, and validation.',
      'Swagger documents the contract; tests enforce the contract.',
      'Use factories/helpers when test setup repeats.',
    ],
    mistakes: [
      'Testing only status code and not response data.',
      'Not testing validation errors.',
      'Not testing unauthenticated and unauthorized requests.',
      'Letting docs become stale because schema generation is not checked.',
    ],
    practiceTitle: 'Permission test example',
    practiceCode: `def test_accounts_requires_admin(self):
    self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {normal_user_token}")

    response = self.client.get("/api/v1/accounts/")

    self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)`,
  },
  authentication: {
    mustKnow: [
      'Authentication identifies the requester.',
      'DRF tries authentication classes in order.',
      'Successful authentication sets request.user and request.auth.',
      'Session auth needs CSRF protection for unsafe methods.',
      'JWT access tokens should be short-lived; refresh tokens need careful handling.',
    ],
    mistakes: [
      'Confusing authentication with permission.',
      'Storing sensitive tokens without understanding XSS risk.',
      'Using BasicAuthentication over plain HTTP.',
      'Forgetting to send Authorization headers from React.',
    ],
    practiceTitle: 'JWT request example',
    practiceCode: `const response = await fetch("/api/v1/user-details/", {
  headers: {
    Authorization: \`Bearer \${accessToken}\`,
    "Content-Type": "application/json",
  },
})`,
  },
  permissions: {
    mustKnow: [
      'Permissions decide whether an authenticated or anonymous requester is allowed.',
      'has_permission checks general endpoint access.',
      'has_object_permission checks one object.',
      'AllowAny should be used deliberately for public endpoints.',
      'Object-level permissions are essential for owner-only APIs.',
    ],
    mistakes: [
      'Using IsAuthenticated when admin-only access is required.',
      'Forgetting object-level checks on retrieve/update/delete.',
      'Making login private by forgetting AllowAny.',
      'Putting business access rules only in the frontend.',
    ],
    practiceTitle: 'Owner-only object permission',
    practiceCode: `class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]`,
  },
  advanced: {
    mustKnow: [
      'Production settings should be environment-driven.',
      'Use DEBUG=False and correct ALLOWED_HOSTS in production.',
      'Measure query count before optimizing.',
      'Use throttling for abuse control, caching for repeated expensive work.',
      'Deployment needs logs, monitoring, backups, HTTPS, and repeatable release steps.',
    ],
    mistakes: [
      'Deploying with DEBUG=True.',
      'Putting secrets in source code.',
      'Adding cache before fixing N+1 queries.',
      'Not testing migrations before production deploys.',
    ],
    practiceTitle: 'Environment settings example',
    practiceCode: `import os

SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.environ.get("DEBUG") == "true"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")`,
  },
}

export const drfSetCrudExamples = {
  fbv: `from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["GET", "POST"])
def user_list_create(request):
    # LIST: GET /api/v1/users/
    if request.method == "GET":
        users = UserDetail.objects.all()
        serializer = UserDetailSerializer(users, many=True)
        return Response(serializer.data)

    # CREATE: POST /api/v1/users/
    serializer = UserDetailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def user_detail(request, pk):
    user = get_object_or_404(UserDetail, pk=pk)

    # GET BY ID: GET /api/v1/users/1/
    if request.method == "GET":
        serializer = UserDetailSerializer(user)
        return Response(serializer.data)

    # UPDATE: PUT /api/v1/users/1/
    if request.method == "PUT":
        serializer = UserDetailSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # PARTIAL UPDATE: PATCH /api/v1/users/1/
    if request.method == "PATCH":
        serializer = UserDetailSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # DELETE: DELETE /api/v1/users/1/
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)`,
  apiview: `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class UserListCreateAPIView(APIView):
    # LIST: GET /api/v1/users/
    def get(self, request):
        users = UserDetail.objects.all()
        serializer = UserDetailSerializer(users, many=True)
        return Response(serializer.data)

    # CREATE: POST /api/v1/users/
    def post(self, request):
        serializer = UserDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserDetailAPIView(APIView):
    def get_object(self, pk):
        return get_object_or_404(UserDetail, pk=pk)

    # GET BY ID: GET /api/v1/users/1/
    def get(self, request, pk):
        serializer = UserDetailSerializer(self.get_object(pk))
        return Response(serializer.data)

    # UPDATE: PUT /api/v1/users/1/
    def put(self, request, pk):
        serializer = UserDetailSerializer(self.get_object(pk), data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # PARTIAL UPDATE: PATCH /api/v1/users/1/
    def patch(self, request, pk):
        serializer = UserDetailSerializer(
            self.get_object(pk),
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # DELETE: DELETE /api/v1/users/1/
    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)`,
  'generic-apiview': `from rest_framework import generics, status
from rest_framework.response import Response


class UserListCreateGenericAPIView(generics.GenericAPIView):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    # LIST: GET /api/v1/users/
    def get(self, request):
        users = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(users)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    # CREATE: POST /api/v1/users/
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserDetailGenericAPIView(generics.GenericAPIView):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer
    lookup_field = "pk"

    # GET BY ID: GET /api/v1/users/1/
    def get(self, request, pk):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

    # UPDATE: PUT /api/v1/users/1/
    def put(self, request, pk):
        serializer = self.get_serializer(
            self.get_object(),
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # PARTIAL UPDATE: PATCH /api/v1/users/1/
    def patch(self, request, pk):
        serializer = self.get_serializer(
            self.get_object(),
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # DELETE: DELETE /api/v1/users/1/
    def delete(self, request, pk):
        self.get_object().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)`,
  mixins: `from rest_framework import generics, mixins


class UserListCreateView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    # LIST: GET /api/v1/users/
    def get(self, request):
        return self.list(request)

    # CREATE: POST /api/v1/users/
    def post(self, request):
        return self.create(request)


class UserDetailView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    # GET BY ID: GET /api/v1/users/1/
    def get(self, request, pk):
        return self.retrieve(request, pk=pk)

    # UPDATE: PUT /api/v1/users/1/
    def put(self, request, pk):
        return self.update(request, pk=pk)

    # PARTIAL UPDATE: PATCH /api/v1/users/1/
    def patch(self, request, pk):
        return self.partial_update(request, pk=pk)

    # DELETE: DELETE /api/v1/users/1/
    def delete(self, request, pk):
        return self.destroy(request, pk=pk)`,
  generics: `from rest_framework import generics


class UserListCreateView(generics.ListCreateAPIView):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer
    # LIST: GET /api/v1/users/
    # CREATE: POST /api/v1/users/


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer
    # GET BY ID: GET /api/v1/users/1/
    # UPDATE: PUT /api/v1/users/1/
    # PARTIAL UPDATE: PATCH /api/v1/users/1/
    # DELETE: DELETE /api/v1/users/1/`,
  viewsets: `from rest_framework import viewsets, status
from rest_framework.response import Response


class UserViewSet(viewsets.ViewSet):
    # LIST: GET /api/v1/users/
    def list(self, request):
        users = UserDetail.objects.all()
        serializer = UserDetailSerializer(users, many=True)
        return Response(serializer.data)

    # CREATE: POST /api/v1/users/
    def create(self, request):
        serializer = UserDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # GET BY ID: GET /api/v1/users/1/
    def retrieve(self, request, pk=None):
        user = get_object_or_404(UserDetail, pk=pk)
        serializer = UserDetailSerializer(user)
        return Response(serializer.data)

    # UPDATE: PUT /api/v1/users/1/
    def update(self, request, pk=None):
        user = get_object_or_404(UserDetail, pk=pk)
        serializer = UserDetailSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # PARTIAL UPDATE: PATCH /api/v1/users/1/
    def partial_update(self, request, pk=None):
        user = get_object_or_404(UserDetail, pk=pk)
        serializer = UserDetailSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # DELETE: DELETE /api/v1/users/1/
    def destroy(self, request, pk=None):
        user = get_object_or_404(UserDetail, pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)`,
  'model-viewsets': `from rest_framework import viewsets


class UserDetailViewSet(viewsets.ModelViewSet):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    # Built-in operations:
    # LIST: GET /api/v1/users/
    # CREATE: POST /api/v1/users/
    # GET BY ID: GET /api/v1/users/1/
    # UPDATE: PUT /api/v1/users/1/
    # PARTIAL UPDATE: PATCH /api/v1/users/1/
    # DELETE: DELETE /api/v1/users/1/


router = DefaultRouter()
router.register("users", UserDetailViewSet, basename="user")`,
}

export const drfExtraInterviewQuestions = {
  basics: [
    {
      q: 'What is the difference between an API and an endpoint?',
      a: 'An API is the whole communication contract of the backend. An endpoint is one URL inside that API, such as /api/v1/user-details/.',
    },
    {
      q: 'Why do APIs commonly use JSON?',
      a: 'JSON is lightweight, language-independent, easy for JavaScript to parse, and supported by almost every backend and frontend framework.',
    },
    {
      q: 'What should a GET request do?',
      a: 'GET should read data only. It should not create, update, or delete records because clients and browsers may safely retry GET requests.',
    },
    {
      q: 'What is the role of HTTP status codes?',
      a: 'Status codes tell the client the result of a request, such as 200 for success, 201 for created, 400 for validation errors, 401 for unauthenticated, and 404 for not found.',
    },
    {
      q: 'What is the browsable API useful for?',
      a: 'It lets developers inspect and test DRF endpoints directly in the browser without needing Postman or frontend code.',
    },
  ],
  'project-structure': [
    {
      q: 'Why do Django projects have both project urls.py and app urls.py?',
      a: 'Project urls.py controls global URL mounting. App urls.py keeps feature-specific routes close to the views and serializers they use.',
    },
    {
      q: 'Where do you register rest_framework and local apps?',
      a: 'Register them in INSTALLED_APPS inside settings.py so Django can discover their models, templates, migrations, and DRF behavior.',
    },
    {
      q: 'Where should model fields be defined?',
      a: 'Model fields belong in models.py because they define database tables and columns.',
    },
    {
      q: 'Where should request validation be defined?',
      a: 'Request validation usually belongs in serializers.py, especially for API payloads that create or update model data.',
    },
    {
      q: 'Why use migrations?',
      a: 'Migrations turn model changes into repeatable database schema changes that can be applied consistently across machines and environments.',
    },
  ],
  'models-serializers': [
    {
      q: 'Why can we not directly return Django model objects as JSON?',
      a: 'Model objects contain Python and ORM behavior. They must be converted into primitive data types such as dicts, lists, strings, and numbers before JSON rendering.',
    },
    {
      q: 'What happens when serializer.is_valid() is called?',
      a: 'DRF validates incoming data, runs field validators, runs object-level validation, and stores cleaned data in serializer.validated_data.',
    },
    {
      q: 'What is serializer.data?',
      a: 'serializer.data is the representation that DRF returns to the client, usually JSON-ready Python data.',
    },
    {
      q: 'What is serializer.validated_data?',
      a: 'validated_data is the cleaned input data after validation succeeds. It is used inside create() and update() to save database records.',
    },
    {
      q: 'When should you use a plain Serializer instead of ModelSerializer?',
      a: 'Use a plain Serializer for custom payloads that do not map directly to one model, such as login forms, report responses, or combined dashboard data.',
    },
  ],
  'crud-router': [
    {
      q: 'What URL does a router create for list and create?',
      a: 'For a registered users route, the router maps list and create to /users/. GET lists records and POST creates a record.',
    },
    {
      q: 'What URL does a router create for detail actions?',
      a: 'The router maps retrieve, update, partial_update, and destroy to /users/{id}/.',
    },
    {
      q: 'What is basename in router.register()?',
      a: 'basename is used to generate route names. It is required when DRF cannot infer a name from queryset.',
    },
    {
      q: 'How do you customize delete behavior in ModelViewSet?',
      a: 'Override perform_destroy() for simple delete customization, or override destroy() when the response flow or validation must change.',
    },
    {
      q: 'Why can ModelViewSet be risky without permissions?',
      a: 'It exposes full CRUD actions, so an authenticated user may be able to update or delete records unless permissions restrict access.',
    },
  ],
  relationships: [
    {
      q: 'What is the difference between ForeignKey and OneToOneField?',
      a: 'ForeignKey allows many child records to point to one parent. OneToOneField allows only one child record for one parent.',
    },
    {
      q: 'How do you enforce one company per user with ForeignKey?',
      a: 'Add a UniqueConstraint on the user_detail field or validate that no company already exists for that user.',
    },
    {
      q: 'What problem does select_related solve?',
      a: 'It prevents extra queries when reading ForeignKey or OneToOne related objects by joining the related table in the original query.',
    },
    {
      q: 'What problem does prefetch_related solve?',
      a: 'It optimizes reverse and many relationships by fetching related rows in a separate query and joining them in Python.',
    },
    {
      q: 'Why expose user_name in CompanyDetailSerializer?',
      a: 'It gives the frontend display-ready joined data and avoids making another request for each company row.',
    },
  ],
  'validation-nested': [
    {
      q: 'What is raise_exception=True used for?',
      a: 'It tells serializer.is_valid() to automatically raise a validation error response if the input is invalid.',
    },
    {
      q: 'When does serializer.save() call create()?',
      a: 'It calls create() when the serializer was created without an existing instance.',
    },
    {
      q: 'When does serializer.save() call update()?',
      a: 'It calls update() when the serializer was created with an existing model instance.',
    },
    {
      q: 'Why do writable nested serializers need custom create() or update()?',
      a: 'DRF does not always know how to save parent and child records together, so you must define how nested validated data should be created or updated.',
    },
    {
      q: 'What is partial=True?',
      a: 'partial=True allows PATCH requests to update only provided fields instead of requiring every required field.',
    },
  ],
  'soft-delete': [
    {
      q: 'Soft delete vs hard delete?',
      a: 'Soft delete marks a record as deleted while keeping it in the database. Hard delete physically removes the row.',
    },
    {
      q: 'Why keep objects as the full manager?',
      a: 'Keeping objects as the full table manager gives tests, admin logic, and internal code a way to access both active and deleted records.',
    },
    {
      q: 'Why use active_objects in normal APIs?',
      a: 'It keeps normal list and detail endpoints focused on records users should currently see.',
    },
    {
      q: 'Why override destroy() instead of only perform_destroy()?',
      a: 'Override destroy() when you need pre-delete checks or a custom error response before deletion happens.',
    },
    {
      q: 'How can a soft-deleted record be restored?',
      a: 'Create a custom action such as PATCH /user-details/{id}/undelete/ that sets is_deleted back to False.',
    },
  ],
  'pagination-search': [
    {
      q: 'What fields are returned in a paginated response?',
      a: 'DRF page-number pagination returns count, next, previous, and results.',
    },
    {
      q: 'What is page_size used for?',
      a: 'page_size lets the client request how many records should be returned per page, if the pagination class allows it.',
    },
    {
      q: 'What is the difference between search and filter?',
      a: 'Search is a broad keyword match across configured fields. Filters are precise conditions such as gender=Female or age=25.',
    },
    {
      q: 'How does OrderingFilter work?',
      a: 'The client sends ordering=name or ordering=-age, and DRF sorts the queryset by allowed ordering_fields.',
    },
    {
      q: 'Why validate numeric filters like age?',
      a: 'Invalid numeric query values should not crash the API or produce incorrect queries. They should return no data or a clear validation response.',
    },
  ],
  'frontend-integration': [
    {
      q: 'Why should React not call database logic directly?',
      a: 'The database is protected behind the backend. React should call API endpoints, and Django should handle validation, permissions, and database access.',
    },
    {
      q: 'Where should the JWT be sent from the frontend?',
      a: 'Send it in the Authorization header as Bearer <access_token> for protected API requests.',
    },
    {
      q: 'What does response.ok check?',
      a: 'It checks whether the HTTP status is in the 200 to 299 success range.',
    },
    {
      q: 'Why do list screens use query params?',
      a: 'Query params make page, page_size, search, filters, and ordering visible and easy for DRF to read from request.query_params.',
    },
    {
      q: 'Why should frontend validation not be the only validation?',
      a: 'Users can bypass frontend code. The backend must still validate data through serializers, permissions, and database constraints.',
    },
  ],
  middleware: [
    {
      q: 'What are common uses for middleware?',
      a: 'Common uses include security headers, CORS, sessions, CSRF, authentication support, logging, timing, request IDs, and locale selection.',
    },
    {
      q: 'Can middleware return a response before the view runs?',
      a: 'Yes. Middleware can short-circuit the request, for example by blocking a request or returning a redirect.',
    },
    {
      q: 'Should validation rules be placed in middleware?',
      a: 'Only request-wide validation belongs there. Endpoint input validation belongs in serializers or views.',
    },
    {
      q: 'How do you register middleware?',
      a: 'Add the Python import path of the middleware class to the MIDDLEWARE list in settings.py.',
    },
    {
      q: 'Why might a frontend care about middleware?',
      a: 'Middleware often controls CORS, authentication-related behavior, security headers, and debugging headers that affect browser requests.',
    },
  ],
  'abstract-models': [
    {
      q: 'Does Django create a table for an abstract model?',
      a: 'No. Django copies fields from the abstract model into each concrete child model table.',
    },
    {
      q: 'What is a good example of abstract model reuse?',
      a: 'A TimestampedModel with created_at and updated_at fields reused by Account, UserDetail, and CompanyDetail.',
    },
    {
      q: 'What happens when you add a field to an abstract base model?',
      a: 'Django generates schema changes for every concrete model that inherits from that base model.',
    },
    {
      q: 'Abstract model vs proxy model?',
      a: 'An abstract model shares fields and methods with child models. A proxy model changes Python behavior for an existing table without adding fields.',
    },
    {
      q: 'Abstract model vs multi-table inheritance?',
      a: 'Abstract inheritance does not create a parent table. Multi-table inheritance creates a parent table and joins child tables to it.',
    },
  ],
  'testing-docs': [
    {
      q: 'What should API tests verify besides status codes?',
      a: 'They should verify response shape, database changes, validation errors, permissions, pagination, filtering, ordering, and edge cases.',
    },
    {
      q: 'Why use status.HTTP_201_CREATED instead of 201?',
      a: 'Named constants make tests more readable and reduce confusion about what each numeric status code means.',
    },
    {
      q: 'What is format="json" in APITestCase?',
      a: 'It tells the test client to send JSON data with the correct content type.',
    },
    {
      q: 'What does OpenAPI describe?',
      a: 'It describes endpoints, methods, parameters, request bodies, response bodies, authentication, and schemas.',
    },
    {
      q: 'Why should validation cases be tested?',
      a: 'Validation tests protect business rules and make sure the frontend receives predictable error messages.',
    },
  ],
  authentication: [
    {
      q: 'What is request.user?',
      a: 'request.user is the authenticated user object or an anonymous user if authentication did not succeed.',
    },
    {
      q: 'What is request.auth?',
      a: 'request.auth contains authentication information, such as the token object or token payload depending on the authentication backend.',
    },
    {
      q: 'What is BasicAuthentication?',
      a: 'BasicAuthentication reads username and password from the Authorization header. It is simple but should only be used over HTTPS.',
    },
    {
      q: 'What is SessionAuthentication?',
      a: 'SessionAuthentication uses Django session cookies. It is useful for browser sessions and the DRF browsable API.',
    },
    {
      q: 'TokenAuthentication vs JWTAuthentication?',
      a: 'TokenAuthentication uses a stored token from the database. JWTAuthentication uses signed tokens and usually supports access/refresh token flows.',
    },
    {
      q: 'Why is JWT common in React apps?',
      a: 'React can store the token and send it with each API request without relying on Django templates or server-rendered sessions.',
    },
  ],
  permissions: [
    {
      q: 'Why should login use AllowAny?',
      a: 'Users must be able to call login before they have a token, so the endpoint must be public.',
    },
    {
      q: 'What is the difference between 401 and 403?',
      a: '401 means the request is not authenticated. 403 means the user is authenticated but does not have permission.',
    },
    {
      q: 'Where should permission_classes be set?',
      a: 'They can be set globally in settings or per view/ViewSet. Per-view settings override or specialize behavior for that endpoint.',
    },
    {
      q: 'What does AllowAny do?',
      a: 'AllowAny lets any user call the endpoint, even if they are not logged in.',
    },
    {
      q: 'What does IsAuthenticated do?',
      a: 'IsAuthenticated allows only requests with a valid authenticated user.',
    },
    {
      q: 'What is IsAuthenticatedOrReadOnly?',
      a: 'It allows safe read methods like GET for everyone, but requires authentication for write methods like POST, PUT, PATCH, and DELETE.',
    },
    {
      q: 'What is has_object_permission?',
      a: 'It checks whether the requester can access one specific object, such as allowing only an owner to edit their own record.',
    },
    {
      q: 'When do you write a custom permission?',
      a: 'Write one when built-in permissions cannot express your business rule, such as custom account roles or owner-only workflows.',
    },
  ],
  advanced: [
    {
      q: 'Why should DEBUG be False in production?',
      a: 'DEBUG=True can expose sensitive error details and is not optimized for production behavior.',
    },
    {
      q: 'Why use environment variables?',
      a: 'They keep secrets and environment-specific settings out of source code.',
    },
    {
      q: 'What is an N+1 query problem?',
      a: 'It happens when one query loads a list and then each row triggers another query for related data.',
    },
    {
      q: 'What is throttling in DRF?',
      a: 'Throttling limits how many requests a client can make in a time window.',
    },
    {
      q: 'What is a custom exception handler useful for?',
      a: 'It creates one consistent error response format across the whole API.',
    },
  ],
}

export const modelGuideSections = {
  overview: [
    {
      title: 'What models.py does',
      body: 'models.py defines database tables using Python classes. Each model class becomes a table, and each model field becomes a column or relationship.',
    },
    {
      title: 'Basic model syntax',
      body: 'Create a class that inherits models.Model, then define fields as class attributes. Django reads this structure and creates migrations.',
    },
    {
      title: 'Migrations',
      body: 'After changing models.py, run makemigrations to create migration files and migrate to apply them to the database.',
    },
    {
      title: 'Field options',
      body: 'Options such as max_length, default, null, blank, unique, choices, db_index, and related_name control database behavior and validation behavior.',
    },
    {
      title: 'Abstract base models',
      body: 'Abstract base models hold repeated fields or methods, such as created_at and updated_at, without creating a separate parent database table.',
    },
  ],
  mustKnow: [
    'Every model class should represent one clear database concept.',
    'CharField needs max_length; TextField does not.',
    'Use DecimalField for money, not FloatField.',
    'Use default=dict for JSONField defaults, not default={}.',
    'Use related_name for readable reverse relationships.',
    'Use constraints for business rules that must be protected at database level.',
    'Use abstract base models for shared fields that should exist on many tables.',
  ],
  mistakes: [
    'Using null=True on CharField/TextField when blank=True is usually enough.',
    'Forgetting to run makemigrations and migrate after model changes.',
    'Putting request/user-specific API logic inside model classes.',
    'Using CASCADE when child data should be protected.',
    'Relying only on serializer validation for rules that need database protection.',
    'Forgetting abstract = True on a base model that should not get its own table.',
  ],
  fieldGroups: [
    {
      title: 'Text fields',
      fields: [
        ['CharField', 'Short text. Requires max_length. Example: models.CharField(max_length=255).'],
        ['TextField', 'Long text. Good for descriptions and notes.'],
        ['EmailField', 'Text field with email validation.'],
        ['URLField', 'Text field with URL validation.'],
        ['SlugField', 'URL-friendly text such as learn-drf.'],
      ],
    },
    {
      title: 'Number fields',
      fields: [
        ['IntegerField', 'Stores whole numbers.'],
        ['PositiveIntegerField', 'Stores zero or positive whole numbers.'],
        ['BigIntegerField', 'Stores very large whole numbers.'],
        ['DecimalField', 'Stores exact decimal values. Use max_digits and decimal_places.'],
        ['FloatField', 'Stores floating point numbers. Good for measurement, not money.'],
      ],
    },
    {
      title: 'Boolean and date fields',
      fields: [
        ['BooleanField', 'Stores True or False.'],
        ['DateField', 'Stores only date.'],
        ['TimeField', 'Stores only time.'],
        ['DateTimeField', 'Stores date and time. Common options: auto_now, auto_now_add.'],
        ['DurationField', 'Stores a time duration.'],
      ],
    },
    {
      title: 'File, image, and JSON fields',
      fields: [
        ['FileField', 'Stores uploaded file path. Requires media settings.'],
        ['ImageField', 'Stores uploaded image path. Usually needs Pillow installed.'],
        ['JSONField', 'Stores JSON data such as dicts/lists. Useful for flexible metadata.'],
        ['BinaryField', 'Stores raw binary data. Less common in normal APIs.'],
      ],
    },
    {
      title: 'Relationship fields',
      fields: [
        ['ForeignKey', 'Many-to-one relation. Many company records can point to one user.'],
        ['OneToOneField', 'One-to-one relation. One profile for one user.'],
        ['ManyToManyField', 'Many-to-many relation. One student can join many courses and one course can have many students.'],
      ],
    },
  ],
  optionRows: [
    ['max_length', 'Maximum length for text fields. Required on CharField.'],
    ['default', 'Value used when no value is provided.'],
    ['null=True', 'Database can store NULL. Mostly database-level behavior.'],
    ['blank=True', 'Forms/serializers can accept empty input. Validation-level behavior.'],
    ['unique=True', 'Database prevents duplicate values.'],
    ['choices', 'Limits value to predefined options.'],
    ['db_index=True', 'Adds an index for faster filtering/searching on that field.'],
    ['related_name', 'Reverse relation name for ForeignKey/OneToOne/ManyToMany.'],
    ['on_delete', 'Controls what happens to child rows when parent is deleted.'],
    ['abstract = True', 'Makes a model reusable as a base class without creating its own table.'],
  ],
  examples: [
    {
      title: 'Abstract timestamp model',
      code: `class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserDetail(TimestampedModel):
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)`,
    },
    {
      title: 'Basic model syntax',
      code: `from django.db import models


class UserDetail(models.Model):
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name`,
    },
    {
      title: 'Field options and choices',
      code: `class Product(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("archived", "Archived"),
    ]

    title = models.CharField(max_length=200, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)`,
    },
    {
      title: 'ForeignKey, OneToOneField, ManyToManyField',
      code: `class CompanyDetail(models.Model):
    user_detail = models.ForeignKey(
        UserDetail,
        on_delete=models.CASCADE,
        related_name="company_details",
    )
    company_name = models.CharField(max_length=255)


class Profile(models.Model):
    user = models.OneToOneField(UserDetail, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)


class Course(models.Model):
    students = models.ManyToManyField(UserDetail, related_name="courses")
    title = models.CharField(max_length=255)`,
    },
    {
      title: 'Meta constraints',
      code: `class CompanyDetail(models.Model):
    user_detail = models.ForeignKey(UserDetail, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user_detail"],
                name="unique_company_detail_per_user",
            )
        ]
        ordering = ["company_name"]`,
    },
  ],
}

export const serializerGuideSections = {
  overview: [
    {
      title: 'What serializers.py does',
      body: 'serializers.py defines how API input is validated and how model objects are converted into JSON responses.',
    },
    {
      title: 'Two directions',
      body: 'Output direction converts model objects to JSON-ready data. Input direction validates request.data and converts it to validated_data.',
    },
    {
      title: 'Serializer vs ModelSerializer',
      body: 'Serializer is manual and flexible. ModelSerializer is model-based and faster for normal CRUD APIs.',
    },
    {
      title: 'save() decides create or update',
      body: 'serializer.save() calls create() when there is no instance and update() when an instance is passed to the serializer.',
    },
  ],
  mustKnow: [
    'Use is_valid() before save().',
    'Use raise_exception=True for standard DRF validation responses.',
    'Use read_only_fields for server-controlled output fields.',
    'Use write_only=True for input that should not appear in responses.',
    'Use partial=True for PATCH.',
    'Override create() and update() only when default ModelSerializer save behavior is not enough.',
  ],
  mistakes: [
    'Using serializer.data before calling is_valid() on input serializers.',
    'Confusing validated_data with serializer.data.',
    'Returning password or secret fields in API output.',
    'Forgetting to remove immutable fields inside update().',
    'Writing nested records without transaction.atomic.',
  ],
  concepts: [
    ['fields', 'Controls which fields appear in the API.'],
    ['read_only_fields', 'Fields returned by API but not accepted in input.'],
    ['write_only=True', 'Input-only field such as password.'],
    ['source', 'Reads data from another attribute, such as user_detail.name.'],
    ['SerializerMethodField', 'Computed output field from a method.'],
    ['validate_<field>', 'Field-level validation.'],
    ['validate(self, attrs)', 'Object-level validation across multiple fields.'],
    ['create(self, validated_data)', 'Custom create logic for POST.'],
    ['update(self, instance, validated_data)', 'Custom update logic for PUT/PATCH.'],
    ['to_representation', 'Customize final output representation.'],
  ],
  examples: [
    {
      title: 'Basic ModelSerializer',
      code: `from rest_framework import serializers
from .models import UserDetail


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetail
        fields = ["id", "name", "age", "gender"]
        read_only_fields = ["id"]`,
    },
    {
      title: 'Field-level validation',
      code: `class UserDetailSerializer(serializers.ModelSerializer):
    def validate_name(self, value):
        name = value.strip()

        if UserDetail.objects.filter(name__iexact=name).exists():
            raise serializers.ValidationError("Name must be unique.")

        return name`,
    },
    {
      title: 'Object-level validation',
      code: `class CompanyDetailSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if (
            self.instance
            and "user_detail" in attrs
            and attrs["user_detail"].id != self.instance.user_detail_id
        ):
            raise serializers.ValidationError({
                "user_detail": "Company details cannot be moved."
            })

        return attrs`,
    },
    {
      title: 'Custom create()',
      code: `class UserDetailSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        # Add custom logic before save.
        user = UserDetail.objects.create(**validated_data)

        # Add custom logic after save.
        return user`,
    },
    {
      title: 'Custom update()',
      code: `class CompanyDetailSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        # Prevent changing immutable fields.
        validated_data.pop("user_detail", None)

        for field in ["company_name", "role", "location"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()
        return instance`,
    },
    {
      title: 'Nested serializer create/update with transaction',
      code: `from django.db import transaction


class UserDetailSerializer(serializers.ModelSerializer):
    company_detail = CompanyDetailNestedSerializer(required=False)

    @transaction.atomic
    def create(self, validated_data):
        company_data = validated_data.pop("company_detail", None)
        user = UserDetail.objects.create(**validated_data)

        if company_data:
            CompanyDetail.objects.create(user_detail=user, **company_data)

        return user`,
    },
    {
      title: 'Computed and joined fields',
      code: `class CompanyDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user_detail.name", read_only=True)
    label = serializers.SerializerMethodField()

    class Meta:
        model = CompanyDetail
        fields = ["id", "user_detail", "user_name", "company_name", "label"]

    def get_label(self, obj):
        return f"{obj.user_detail.name} - {obj.company_name}"`,
    },
  ],
}

export const drfFileGuides = [
  {
    id: 'urls',
    fileName: 'urls.py',
    title: 'URL Routing and Routers',
    summary: 'urls.py maps browser/API paths to Django views or DRF ViewSets.',
    mustKnow: [
      'Project urls.py includes app urls.py.',
      'App urls.py maps endpoint paths to views or routers.',
      'DRF routers generate URLs for ViewSets automatically.',
      'path() is enough for most Django routes; re_path() is for regex routes.',
      'include() lets one URL file delegate to another URL file.',
    ],
    mistakes: [
      'Forgetting the trailing slash when the API expects it.',
      'Registering a ViewSet but forgetting to include router.urls.',
      'Duplicating prefixes in both project and app urls.py.',
      'Using manual CRUD paths when a router would be clearer.',
    ],
    examples: [
      {
        title: 'Project urls.py',
        code: `from django.urls import include, path


urlpatterns = [
    path("api/v1/", include("api.urls")),
]`,
      },
      {
        title: 'App urls.py with DRF router',
        code: `from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import UserDetailViewSet, CompanyDetailViewSet


router = DefaultRouter()
router.register("user-details", UserDetailViewSet, basename="user-detail")
router.register("company-details", CompanyDetailViewSet, basename="company-detail")

urlpatterns = [
    path("", include(router.urls)),
]`,
      },
      {
        title: 'Manual APIView URLs',
        code: `urlpatterns = [
    path("users/", UserListCreateAPIView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserDetailAPIView.as_view(), name="user-detail"),
]`,
      },
    ],
  },
  {
    id: 'views',
    fileName: 'views.py',
    title: 'API Logic and Querysets',
    summary: 'views.py receives requests, chooses querysets, runs serializers, and returns API responses.',
    mustKnow: [
      'Views should coordinate request flow, not hold all business logic.',
      'get_queryset() is the right place for dynamic filtering by user, query params, or soft delete state.',
      'get_serializer_class() is useful when list/detail/create need different serializers.',
      'perform_create(), perform_update(), and perform_destroy() customize save/delete hooks.',
      'Use Response and DRF status codes for consistent API responses.',
    ],
    mistakes: [
      'Putting large business workflows directly inside view methods.',
      'Using Model.objects.all() everywhere without permission/user filtering.',
      'Overriding create() when perform_create() is enough.',
      'Returning Django JsonResponse in DRF views instead of Response.',
    ],
    examples: [
      {
        title: 'ModelViewSet with get_queryset',
        code: `class UserDetailViewSet(viewsets.ModelViewSet):
    serializer_class = UserDetailSerializer

    def get_queryset(self):
        if self.request.query_params.get("deleted") == "true":
            return UserDetail.deleted_objects.all()

        return UserDetail.active_objects.all()`,
      },
      {
        title: 'perform_create and perform_destroy hooks',
        code: `class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])`,
      },
      {
        title: 'Custom @action endpoint',
        code: `class UserDetailViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=["patch"], url_path="undelete")
    def undelete(self, request, pk=None):
        user = get_object_or_404(UserDetail.deleted_objects, pk=pk)
        user.is_deleted = False
        user.save(update_fields=["is_deleted"])
        return Response(self.get_serializer(user).data)`,
      },
    ],
  },
  {
    id: 'middleware-file',
    fileName: 'middleware.py',
    title: 'Request and Response Middleware',
    summary: 'middleware.py contains reusable request/response layers that run around Django views.',
    mustKnow: [
      'Middleware classes receive get_response in __init__.',
      '__call__ receives the request and must return a response.',
      'Middleware order in settings.py affects request and response behavior.',
      'Use middleware for cross-cutting concerns, not endpoint-specific business rules.',
      'Response headers from middleware are visible in the browser network panel.',
    ],
    mistakes: [
      'Doing slow database work on every request.',
      'Putting serializer validation or ViewSet logic in middleware.',
      'Forgetting to register the middleware in settings.py.',
      'Assuming middleware order does not matter.',
    ],
    examples: [
      {
        title: 'Request timing middleware',
        code: `import logging
from time import perf_counter


logger = logging.getLogger(__name__)


class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started_at = perf_counter()
        response = self.get_response(request)
        duration_ms = (perf_counter() - started_at) * 1000

        response["X-Request-Duration-ms"] = f"{duration_ms:.2f}"
        logger.info(
            "%s %s %s %.2fms",
            request.method,
            request.get_full_path(),
            response.status_code,
            duration_ms,
        )
        return response`,
      },
      {
        title: 'settings.py registration',
        code: `MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "api.middleware.RequestTimingMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
]`,
      },
      {
        title: 'Frontend inspection',
        code: `const response = await fetch("/api/v1/dashboard-summary/", {
  headers: { Authorization: \`Bearer \${accessToken}\` },
})

console.log(response.headers.get("X-Request-Duration-ms"))`,
      },
    ],
  },
  {
    id: 'pagination',
    fileName: 'pagination.py',
    title: 'Pagination Classes',
    summary: 'pagination.py controls how large querysets are split into pages and how pagination metadata is returned.',
    mustKnow: [
      'PageNumberPagination uses page and optional page_size query params.',
      'LimitOffsetPagination uses limit and offset.',
      'CursorPagination is better for large changing datasets.',
      'page_size_query_param lets the frontend control rows per page.',
      'max_page_size protects the backend from huge requests.',
    ],
    mistakes: [
      'Allowing unlimited page_size.',
      'Returning unpaginated large lists.',
      'Changing pagination response shape without updating frontend code.',
      'Using cursor pagination without stable ordering.',
    ],
    examples: [
      {
        title: 'Dynamic page-number pagination',
        code: `from rest_framework.pagination import PageNumberPagination


class DynamicPageNumberPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "page_size"
    max_page_size = 100`,
      },
      {
        title: 'Global settings',
        code: `REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "api.pagination.DynamicPageNumberPagination",
    "PAGE_SIZE": 5,
}`,
      },
      {
        title: 'Paginated response shape',
        code: `{
  "count": 42,
  "next": "http://localhost:8000/api/v1/users/?page=3",
  "previous": "http://localhost:8000/api/v1/users/?page=1",
  "results": []
}`,
      },
    ],
  },
  {
    id: 'permissions-file',
    fileName: 'permissions.py',
    title: 'Custom Permission Classes',
    summary: 'permissions.py contains reusable access rules for endpoints and objects.',
    mustKnow: [
      'has_permission() checks general endpoint access.',
      'has_object_permission() checks access to one object.',
      'Return True to allow and False to deny.',
      'Use built-in permissions where possible before writing custom ones.',
      'Permission classes should not mutate data.',
    ],
    mistakes: [
      'Checking only has_permission when object ownership matters.',
      'Using frontend role checks as the only protection.',
      'Writing database-heavy permission checks for every request.',
      'Returning custom Response objects from permission methods instead of True/False.',
    ],
    examples: [
      {
        title: 'Admin account permission',
        code: `from rest_framework.permissions import BasePermission


class IsAdminAccount(BasePermission):
    message = "Admin account required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )`,
      },
      {
        title: 'Owner-only object permission',
        code: `class IsOwner(BasePermission):
    message = "You can only access your own records."

    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id`,
      },
      {
        title: 'Using permission_classes',
        code: `class AccountViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminAccount]`,
      },
    ],
  },
  {
    id: 'authentication-file',
    fileName: 'authentication.py',
    title: 'Custom Authentication Classes',
    summary: 'authentication.py is used when built-in Session, Basic, Token, or JWT authentication is not enough.',
    mustKnow: [
      'Authentication identifies the requester and returns (user, auth).',
      'Return None when the class does not handle the request.',
      'Raise AuthenticationFailed when credentials are present but invalid.',
      'Most projects should use built-in JWT/session/token auth instead of custom auth.',
      'Custom auth is useful for API keys, signed headers, or legacy tokens.',
    ],
    mistakes: [
      'Writing custom authentication when permissions would solve the problem.',
      'Returning a user without validating the credential.',
      'Raising errors when the auth header is simply absent and another auth class could handle it.',
      'Putting role/permission checks inside authentication.',
    ],
    examples: [
      {
        title: 'Simple API key authentication',
        code: `from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ApiKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        api_key = request.headers.get("X-API-Key")

        if not api_key:
            return None

        account = Account.objects.filter(api_key=api_key, is_active=True).first()

        if not account:
            raise AuthenticationFailed("Invalid API key.")

        return (account, api_key)`,
      },
      {
        title: 'Register custom authentication',
        code: `REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "api.authentication.ApiKeyAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}`,
      },
      {
        title: 'Per-view authentication',
        code: `class InternalReportView(APIView):
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [IsAuthenticated]`,
      },
    ],
  },
  {
    id: 'apps',
    fileName: 'apps.py',
    title: 'App Configuration',
    summary: 'apps.py defines Django app metadata and startup hooks.',
    mustKnow: [
      'Every app has an AppConfig class.',
      'name should be the full Python path to the app.',
      'default_auto_field controls default primary key type.',
      'ready() can import signals when the app starts.',
      'Avoid heavy database queries in ready().',
    ],
    mistakes: [
      'Putting request-time logic in apps.py.',
      'Running database queries in ready() during startup.',
      'Forgetting to register the app in INSTALLED_APPS.',
      'Importing signals in a way that causes circular imports.',
    ],
    examples: [
      {
        title: 'Basic AppConfig',
        code: `from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"`,
      },
      {
        title: 'Loading signals safely',
        code: `class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        import api.signals`,
      },
      {
        title: 'INSTALLED_APPS registration',
        code: `INSTALLED_APPS = [
    "api.apps.ApiConfig",
    "rest_framework",
]`,
      },
    ],
  },
  {
    id: 'admin',
    fileName: 'admin.py',
    title: 'Django Admin Registration',
    summary: 'admin.py controls how models appear in the Django admin site.',
    mustKnow: [
      'admin.py is for Django admin UI, not API behavior.',
      'Register models to manage them in /admin/.',
      'ModelAdmin controls list columns, search, filters, and read-only fields.',
      'Admin is useful for internal staff workflows.',
      'Admin permissions are separate from DRF API permissions.',
    ],
    mistakes: [
      'Assuming admin.py changes API output.',
      'Exposing sensitive fields in admin list_display.',
      'Not adding search_fields for large tables.',
      'Using admin as the only validation layer.',
    ],
    examples: [
      {
        title: 'Basic model registration',
        code: `from django.contrib import admin

from .models import UserDetail, CompanyDetail


admin.site.register(UserDetail)
admin.site.register(CompanyDetail)`,
      },
      {
        title: 'Custom ModelAdmin',
        code: `@admin.register(UserDetail)
class UserDetailAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "age", "gender", "is_deleted"]
    list_filter = ["gender", "is_deleted"]
    search_fields = ["name"]
    readonly_fields = ["id"]`,
      },
      {
        title: 'Related model admin',
        code: `@admin.register(CompanyDetail)
class CompanyDetailAdmin(admin.ModelAdmin):
    list_display = ["id", "company_name", "user_detail", "role", "location"]
    search_fields = ["company_name", "user_detail__name", "role"]
    autocomplete_fields = ["user_detail"]`,
      },
    ],
  },
]

export const drfGlossary = [
  ['Django project', 'Site-wide Django configuration package with settings.py, root urls.py, asgi.py, and wsgi.py.'],
  ['Django app', 'Focused Django module that contains feature code such as models, serializers, views, urls, tests, and migrations.'],
  ['manage.py', 'Command-line entry point for Django commands such as runserver, makemigrations, migrate, and test.'],
  ['settings.py', 'Project configuration file for installed apps, middleware, database, DRF settings, CORS, and schema settings.'],
  ['INSTALLED_APPS', 'Django setting that enables Django apps and third-party packages for the project.'],
  ['project urls.py', 'Root URL file that mounts app URL files under prefixes such as api/v1/.'],
  ['app urls.py', 'Feature URL file that maps paths or routers to views inside one app.'],
  ['request.data', 'Parsed input body sent by the client.'],
  ['request.query_params', 'URL query values such as page, search, and ordering.'],
  ['Response', 'DRF response class that renders API data correctly.'],
  ['status', 'Readable HTTP status constants like HTTP_201_CREATED.'],
  ['queryset', 'The database records a view can operate on.'],
  ['serializer_class', 'The serializer used by a view or ViewSet.'],
  ['get_queryset', 'Hook for dynamic queryset logic.'],
  ['get_serializer_class', 'Hook for choosing serializers dynamically.'],
  ['perform_create', 'Hook called when a generic view saves a new object.'],
  ['perform_destroy', 'Hook called during delete behavior.'],
  ['lookup_field', 'Field used to find detail records, default is pk.'],
  ['basename', 'Router name used when queryset is not enough to infer route names.'],
  ['permission_classes', 'Classes that decide whether a request is allowed.'],
  ['authentication_classes', 'Classes that decide who made the request.'],
  ['pagination_class', 'Class controlling page size and response shape.'],
  ['filter_backends', 'Classes that apply search, ordering, or filtering to querysets.'],
  ['serializer.is_valid()', 'Runs serializer validation for incoming data.'],
  ['serializer.errors', 'Validation errors returned when input is invalid.'],
  ['serializer.validated_data', 'Cleaned input data after validation succeeds.'],
  ['serializer.data', 'Output representation returned to the API client.'],
  ['many=True', 'Serializer option for serializing or validating a list of objects.'],
  ['partial=True', 'Serializer option that allows PATCH-style partial updates.'],
  ['context', 'Extra data passed into a serializer, often including request.'],
  ['read_only=True', 'Serializer field can appear in output but not input.'],
  ['write_only=True', 'Serializer field can appear in input but not output.'],
  ['source', 'Serializer option for reading from a different attribute path.'],
  ['SerializerMethodField', 'Read-only computed serializer field.'],
  ['to_representation', 'Serializer hook for customizing final output.'],
  ['to_internal_value', 'Serializer hook for customizing input parsing.'],
  ['APIView', 'Low-level DRF class-based API view.'],
  ['GenericAPIView', 'Base class used with mixins and generic views.'],
  ['ListCreateAPIView', 'Concrete generic view for GET list and POST create.'],
  ['RetrieveUpdateDestroyAPIView', 'Concrete generic view for detail CRUD.'],
  ['ViewSet', 'Class that groups API actions and usually works with routers.'],
  ['ModelViewSet', 'ViewSet with full model CRUD built in.'],
  ['@api_view', 'Decorator for function-based DRF views.'],
  ['@action', 'Decorator for adding custom ViewSet routes.'],
  ['DefaultRouter', 'DRF router that generates ViewSet URLs.'],
  ['reverse relation', 'Accessing related rows from the other side of a relationship.'],
  ['on_delete=models.CASCADE', 'Deletes child rows when parent is deleted.'],
  ['on_delete=models.PROTECT', 'Blocks parent delete while child rows exist.'],
  ['on_delete=models.SET_NULL', 'Sets relation to NULL when parent is deleted.'],
  ['UniqueConstraint', 'Database-level rule that prevents duplicate combinations.'],
  ['ordering', 'Default sort order for a model or queryset.'],
  ['db_index', 'Database index for faster filtering or ordering.'],
  ['transaction.atomic', 'Runs database writes in one transaction with rollback on failure.'],
  ['frontend API contract', 'Agreement between frontend and backend about URLs, methods, payloads, responses, errors, and headers.'],
  ['API base URL', 'Root API URL used by the frontend before endpoint paths.'],
  ['fetch', 'Browser API for making HTTP requests from JavaScript.'],
  ['response.ok', 'Browser Response property that is true for HTTP 2xx statuses.'],
  ['Middleware', 'Django layer that can inspect or change requests and responses around views.'],
  ['get_response', 'Callable passed to middleware for continuing request processing.'],
  ['MIDDLEWARE', 'Django settings list that controls enabled middleware and order.'],
  ['response header', 'Metadata sent with an HTTP response, such as X-Request-Duration-ms.'],
  ['abstract model', 'Django base model with abstract = True that shares fields without creating its own table.'],
  ['concrete model', 'Normal Django model that gets a database table.'],
  ['auto_now_add', 'DateTimeField option that stores the creation timestamp.'],
  ['auto_now', 'DateTimeField option that updates the timestamp when a model is saved.'],
  ['content negotiation', 'DRF process for choosing parser/renderer based on request headers.'],
  ['parser_classes', 'Classes that parse incoming request bodies.'],
  ['renderer_classes', 'Classes that render response data.'],
  ['JSONParser', 'Parser for application/json request bodies.'],
  ['MultiPartParser', 'Parser for file uploads and multipart forms.'],
  ['JSONRenderer', 'Renderer for JSON API responses.'],
  ['throttle_classes', 'Classes that rate limit requests.'],
  ['has_permission', 'Permission method for general endpoint access.'],
  ['has_object_permission', 'Permission method for one object access.'],
  ['AllowAny', 'Permission that allows all users.'],
  ['IsAuthenticated', 'Permission that requires login.'],
  ['IsAdminUser', 'Permission that requires Django admin/staff user.'],
  ['IsAuthenticatedOrReadOnly', 'Permission that allows public reads but protects writes.'],
  ['DjangoModelPermissions', 'Permission class tied to Django model permissions.'],
  ['BasicAuthentication', 'Authentication using username and password in headers.'],
  ['SessionAuthentication', 'Authentication using Django sessions and cookies.'],
  ['TokenAuthentication', 'Authentication using a stored token string.'],
  ['JWTAuthentication', 'Authentication using signed JWT access tokens.'],
  ['CSRF', 'Protection for browser cookie-based unsafe requests.'],
  ['CORS', 'Browser security rule controlling which origins can call the API.'],
  ['401 Unauthorized', 'The request is not authenticated.'],
  ['403 Forbidden', 'The request is authenticated but not allowed.'],
  ['404 Not Found', 'The requested resource does not exist or is hidden.'],
  ['400 Bad Request', 'The request input is invalid.'],
  ['201 Created', 'A resource was created successfully.'],
  ['204 No Content', 'Request succeeded and response body is empty.'],
]
