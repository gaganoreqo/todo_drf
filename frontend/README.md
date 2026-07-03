# User Details Frontend

React Vite frontend for the Django REST Framework user details API.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The app calls:

```text
http://127.0.0.1:8000/api/v1/user-details/
```

The UI has two tabs:

- Active Records calls `/api/v1/user-details/`
- Deleted Records calls `/api/v1/user-details/?deleted=true`
- Pagination sends `page` and `page_size`, for example
  `/api/v1/user-details/?page=2&page_size=10`

Deleting a record uses soft delete, so the record moves from Active Records to
Deleted Records instead of being removed from the database.

To override the API URL, create `.env` in this folder:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1/user-details/
```

## Build

```bash
npm run build
```
