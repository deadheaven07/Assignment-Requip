# Requip User Management

Full-stack user management assignment built with Spring Boot, PostgreSQL, and React. The backend exposes a REST API for creating, listing, updating, and soft-deleting users. The frontend provides a simple user form and paginated table that consumes the API.

## Features

- Create users with name, email, primary/secondary mobile, date of birth, place of birth, addresses, PAN, and Aadhaar.
- Update users with partial request payloads.
- List active users with Spring pagination and sorting.
- Soft delete users by marking them inactive.
- Create, edit, list, paginate, and delete users from the React UI.
- Validate request payloads on both backend and frontend.
- Encrypt PAN and Aadhaar before storing them in PostgreSQL.
- Return masked PAN and Aadhaar values in API responses.
- Handle validation, duplicate data, not found, and optimistic locking errors with `ProblemDetail` responses.

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.2.12
- Spring Web
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Lombok
- JUnit 5, Mockito, AssertJ

### Frontend

- React 18
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod
- Axios
- Tailwind CSS

## Project Structure

```text
.
├── pom.xml
├── README.md
├── src
│   ├── main
│   │   ├── java/com/requip/usermanagement
│   │   │   ├── api
│   │   │   │   ├── dto
│   │   │   │   ├── exception
│   │   │   │   └── UserController.java
│   │   │   ├── application/service
│   │   │   ├── domain
│   │   │   │   ├── model
│   │   │   │   └── repository
│   │   │   ├── infrastructure/persistence
│   │   │   └── UserManagementApiApplication.java
│   │   ├── resources/application.properties
│   │   └── frontend
│   │       ├── package.json
│   │       └── src
│   └── test
│       └── java/com/requip/usermanagement
```

## Prerequisites

- Java 17 or newer
- Maven 3.9 or newer
- PostgreSQL 13 or newer
- Node.js 18 or newer
- npm 9 or newer

## Backend Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE "<DATABASE_NAME>";
```

2. Configure environment variables as needed:

```bash
export DB_URL=<database_connection_url>
export DB_USERNAME=<database_username>
export DB_PASSWORD=<database_password>

export SERVER_PORT=<server_port>
export JPA_DDL_AUTO=update
```

3. Configure an encryption key for sensitive data:

```bash
export USER_DATA_ENCRYPTION_KEY=<base64_encoded_key>
```

The encryption key should be generated securely and must not be committed to source control.

1. Run the backend:

```bash
mvn spring-boot:run
```

The backend starts on:

```text
http://localhost:8081
```

## Frontend Setup

1. Install frontend dependencies:

```bash
cd src/main/frontend
npm install
```

2. Optional: configure the API URL:

```bash
export VITE_USERS_API_URL=http://localhost:<PORT>/api/v1/users
```

3. Run the frontend:

```bash
npm run dev
```

The frontend starts on:

```text
http://localhost:5173
```

## Configuration

The backend reads these settings from `src/main/resources/application.properties`:

| Variable | Default | Description |
| --- | --- | --- |
| `DB_URL` || PostgreSQL JDBC URL |
| `DB_USERNAME` || Database username |
| `DB_PASSWORD` || Database password |
| `SERVER_PORT` || Backend server port |
| `JPA_DDL_AUTO` || Hibernate schema strategy |
| `USER_DATA_ENCRYPTION_KEY` | local fallback key | Base64 AES key for PAN/Aadhaar encryption |

The frontend reads:

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_USERS_API_URL` | `http://localhost:8081/api/v1/users` | Backend users API base URL |

## API Reference

Base URL:

```text
/api/v1/users
```

### Create User

```http
POST /api/v1/users
Content-Type: application/json
```

Example request:
```json
{ "name": "<name>",
 "email": "<email>",
 "primaryMobile": "<mobile_number>",
 "secondaryMobile": "<mobile_number>",
 "dateOfBirth": "<YYYY-MM-DD>",
 "placeOfBirth": "<city_or_place>",
 "currentAddress": "<current_address>",
 "permanentAddress": "<permanent_address>",
 "pan": "<pan_number>",
 "aadhaar": "<aadhaar_number>" }
```

Returns `201 Created` with a `Location` header and masked sensitive fields:



### List Users

```http
GET /api/v1/users?page=0&size=10
```

### Update User

```http
PUT /api/v1/users/{id}
Content-Type: application/json
```

### Delete User

```http
DELETE /api/v1/users/{id}
```


## Validation Rules

| Field | Create | Update | Rule |
| --- | --- | --- | --- |
| `name` | required | optional | 2 to 120 characters, not blank |
| `email` | required | optional | valid email, max 254 characters |
| `primaryMobile` | required | optional | Indian mobile format: starts with 6-9 and has 10 digits |
| `secondaryMobile` | optional | optional | Indian mobile format: starts with 6-9 and has 10 digits |
| `dateOfBirth` | required | optional | must be in the past |
| `placeOfBirth` | optional | optional | max 120 characters |
| `currentAddress` | optional | optional | max 500 characters |
| `permanentAddress` | optional | optional | max 500 characters |
| `pan` | required | optional | format: `ABCDE1234F` |
| `aadhaar` | required | optional | exactly 12 digits |

## Error Responses

The API returns RFC 9457-style `ProblemDetail` bodies for handled errors.

Common statuses:

- `400 Bad Request`: validation failure
- `404 Not Found`: active user was not found
- `409 Conflict`: duplicate unique value or concurrent update conflict

Validation errors include an `errors` object keyed by field name.

## Data Model Notes

- The main table is `users`.
- `id` is generated by PostgreSQL.
- `version` enables optimistic locking.
- `created_at` and `updated_at` are maintained by Hibernate.
- `is_active` controls soft deletion.
- Email and primary mobile are unique among active users.
- PAN and Aadhaar are encrypted with AES/GCM before persistence and masked in responses.
- Secondary mobile, place of birth, current address, and permanent address are optional assignment fields exposed through the API and UI.

## Best Practices Applied

- Layered backend structure with controller, service, repository, DTO, and entity boundaries.
- Bean Validation on API payloads and Zod validation in the frontend.
- Pagination is bounded to avoid very large untrusted page sizes.
- Soft delete keeps historical records while hiding inactive users from list and update flows.
- Optimistic locking is enabled with a `version` column.
- Sensitive identity values are encrypted at rest and masked in API responses.
- Environment variables are used for database and encryption configuration.
- Unit tests cover create, update, delete, not found, and pagination behavior.

## Pain Points And Learnings

- Masked PAN and Aadhaar values should not be reused for edits, so the UI leaves those fields blank in edit mode and only updates them when a new valid value is entered.
- Optional form fields need careful empty-string handling; the frontend omits blank optional values so backend regex validation is not triggered by accidental empty strings.
- Soft delete affects uniqueness rules, so email and primary mobile checks are scoped to active users.
- Keeping DTOs separate from the entity made it easier to control which fields are required, optional, masked, or internal.

## Running Tests

Run backend tests:

```bash
mvn test
```

Run frontend type check and production build:

```bash
cd src/main/frontend
npm run build
```

## Quick Manual Test

After starting the backend, create a user with `curl`:

```bash
curl -i -X POST http://localhost:8081/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "primaryMobile": "9876543210",
    "secondaryMobile": "9876543211",
    "dateOfBirth": "1992-04-12",
    "placeOfBirth": "Pune",
    "currentAddress": "Current address line",
    "permanentAddress": "Permanent address line",
    "pan": "ABCDE1234F",
    "aadhaar": "123456789012"
  }'
```

List users:

```bash
curl "http://localhost:8081/api/v1/users?page=0&size=10"
```

## 👨‍💻 Author

**Harsh Raghuwanshi**
