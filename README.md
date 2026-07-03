# User Details CRUD App

This project has a Django REST Framework backend and a React Vite frontend for
managing user details. It uses SQLite and exposes a user details API with
create, read, update, partial update, and soft delete endpoints.

## Required Packages

Backend:

- Django
- Django REST Framework
- django-cors-headers

Frontend:

- React
- Vite

The exact package versions used in this project are listed in `requirements.txt`.
Frontend package versions are listed in `frontend/package.json`.

## Installation

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

## Migrations

Move into the Django project folder:

```bash
cd backend
```

Create migrations for the `api` app:

```bash
python manage.py makemigrations
```

Apply all migrations to create the SQLite database:

```bash
python manage.py migrate
```

## Run the Server

From the `backend` folder, start the development server:

```bash
python manage.py runserver
```

The API will be available at:

```text
http://127.0.0.1:8000/api/v1/user-details/
```

The backend is configured to allow CORS requests from a React Vite frontend at:

```text
http://localhost:5173
```

## Run the Frontend

Open a second terminal from the project root and install the frontend packages:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

The frontend calls this backend API by default:

```text
http://127.0.0.1:8000/api/v1/user-details/
```

The frontend has two tabs:

- Active Records: shows records where `is_deleted` is `false`
- Deleted Records: shows records where `is_deleted` is `true`
- Deleted Records includes a Restore button that calls the undelete API
- Pagination controls send both `page` and `page_size` to the backend

To use a different backend URL, create `frontend/.env` and set:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1/user-details/
```

## API Endpoints

The API uses a Django REST Framework `ModelViewSet` and router, so CRUD routes
are generated automatically.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/user-details/` | List active user details, 5 per page |
| GET | `/api/v1/user-details/?page=2&page_size=10` | List page 2 with 10 records per page |
| GET | `/api/v1/user-details/?deleted=true&page=1&page_size=5` | List soft-deleted user details |
| GET | `/api/v1/user-details/{id}/` | Retrieve one user detail record |
| POST | `/api/v1/user-details/` | Create a user detail record |
| PUT | `/api/v1/user-details/{id}/` | Replace a user detail record |
| PATCH | `/api/v1/user-details/{id}/` | Partially update a user detail record |
| DELETE | `/api/v1/user-details/{id}/` | Soft delete a user detail record |
| PATCH | `/api/v1/user-details/{id}/undelete/` | Restore a soft-deleted user detail record |

Example request body for `POST`, `PUT`, and `PATCH`:

```json
{
  "name": "Alex",
  "age": 25,
  "gender": "Female",
  "is_deleted": false
}
```

Backend validation rules:

- `name` is required and must be unique, case-insensitively
- `age` is required and must be greater than 0
- `gender` is required
- `is_deleted` is read-only and controlled by soft delete/undelete APIs

Soft delete means the record is not removed from SQLite. It is updated with:

```json
{
  "is_deleted": true
}
```

Undelete restores the record by updating it with:

```json
{
  "is_deleted": false
}
```

Paginated `GET /api/v1/user-details/` responses use the default DRF format:

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

Pagination query parameters:

- `page`: page number to load
- `page_size`: number of records per page, up to 100

The React app sends both values in the URL, for example:

```text
http://127.0.0.1:8000/api/v1/user-details/?page=2&page_size=10
```

## Project Structure

```text
.
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # React CRUD screen and API calls
│   │   ├── App.css     # App layout and component styles
│   │   └── index.css   # Global styles
│   └── package.json    # Frontend scripts and dependencies
backend/
├── api/
│   ├── models.py       # UserDetail model
│   ├── serializers.py  # Converts UserDetail objects to and from JSON
│   ├── views.py        # ModelViewSet for CRUD behavior
│   ├── urls.py         # DRF router for API endpoints
│   └── migrations/     # Database migration files
├── backend/
│   ├── settings.py     # Installed apps, CORS, database, and pagination
│   └── urls.py         # Main URL routes
└── manage.py
```

## Notes

- Authentication is intentionally not included.
- Permissions are intentionally not included.
- JWT, login APIs, and register APIs are intentionally not included.
