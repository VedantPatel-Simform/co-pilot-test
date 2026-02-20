# Task Management API Documentation

## Overview

This is a RESTful API for managing tasks. It provides full CRUD (Create, Read, Update, Delete) operations with input validation, error handling, and status-based filtering. Data is stored in-memory without requiring a database.

## Base URL

```
http://localhost:5000
```

Default port is `5000` (configurable via environment variable `PORT`)

---

## Data Models

### Task Object

| Field         | Type       | Required       | Description                            |
| ------------- | ---------- | -------------- | -------------------------------------- |
| `id`          | number     | Auto-generated | Unique identifier (auto-incrementing)  |
| `title`       | string     | Yes            | Task title (max 200 characters)        |
| `description` | string     | No             | Task description (max 1000 characters) |
| `status`      | TaskStatus | Yes            | Current status of the task             |
| `createdAt`   | Date       | Auto-generated | Timestamp when task was created        |
| `updatedAt`   | Date       | Auto-generated | Timestamp when task was last updated   |

### TaskStatus Enum

Valid status values:

- `pending` - Task has not been started
- `in_progress` - Task is currently being worked on
- `completed` - Task has been completed

---

## API Endpoints

### 1. Create Task

Create a new task in the system.

**Endpoint:** `POST /api/tasks`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the task management system",
  "status": "pending"
}
```

**Validation Rules:**

- `title`: Required, non-empty string, max 200 characters
- `description`: Optional, string, max 1000 characters
- `status`: Required, must be one of: `pending`, `in_progress`, `completed`

**Success Response (201 Created):**

```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the task management system",
  "status": "pending",
  "createdAt": "2026-02-20T10:30:00.000Z",
  "updatedAt": "2026-02-20T10:30:00.000Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing title
{
  "message": "Title is required"
}

// 400 Bad Request - Title too long
{
  "message": "Title must not exceed 200 characters"
}

// 400 Bad Request - Invalid status
{
  "message": "Invalid status. Must be one of: pending, in_progress, completed"
}
```

---

### 2. Get All Tasks

Retrieve all tasks, with optional filtering by status.

**Endpoint:** `GET /api/tasks`

**Query Parameters:**

| Parameter | Type   | Required | Description                                                    |
| --------- | ------ | -------- | -------------------------------------------------------------- |
| `status`  | string | No       | Filter tasks by status (`pending`, `in_progress`, `completed`) |

**Example Requests:**

```
GET /api/tasks
GET /api/tasks?status=pending
GET /api/tasks?status=in_progress
GET /api/tasks?status=completed
```

**Success Response (200 OK):**

```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the task management system",
    "status": "pending",
    "createdAt": "2026-02-20T10:30:00.000Z",
    "updatedAt": "2026-02-20T10:30:00.000Z"
  },
  {
    "id": 2,
    "title": "Review pull requests",
    "description": "Review and merge pending pull requests",
    "status": "in_progress",
    "createdAt": "2026-02-20T11:00:00.000Z",
    "updatedAt": "2026-02-20T11:15:00.000Z"
  }
]
```

**Error Response:**

```json
// 400 Bad Request - Invalid status query parameter
{
  "message": "Invalid status query parameter. Must be one of: pending, in_progress, completed"
}
```

**Notes:**

- Returns an empty array `[]` if no tasks exist
- When filtering by status, returns only tasks matching that status

---

### 3. Get Task by ID

Retrieve a specific task by its ID.

**Endpoint:** `GET /api/tasks/:id`

**URL Parameters:**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | number | Yes      | The unique identifier of the task |

**Example Request:**

```
GET /api/tasks/1
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the task management system",
  "status": "pending",
  "createdAt": "2026-02-20T10:30:00.000Z",
  "updatedAt": "2026-02-20T10:30:00.000Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid ID format
{
  "message": "Invalid task ID"
}

// 404 Not Found - Task doesn't exist
{
  "message": "Task with ID 999 not found"
}
```

---

### 4. Update Task

Update an existing task (partial update - only provided fields are updated).

**Endpoint:** `PATCH /api/tasks/:id`

**URL Parameters:**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | number | Yes      | The unique identifier of the task |

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

All fields are optional, but at least one must be provided:

```json
{
  "title": "Complete and review project documentation",
  "description": "Write comprehensive API documentation and get it reviewed",
  "status": "in_progress"
}
```

**Example Requests:**

```json
// Update only status
{
  "status": "completed"
}

// Update title and description
{
  "title": "New title",
  "description": "New description"
}

// Update all fields
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress"
}
```

**Validation Rules:**

- At least one field must be provided
- `title`: If provided, non-empty string, max 200 characters
- `description`: If provided, string, max 1000 characters
- `status`: If provided, must be one of: `pending`, `in_progress`, `completed`

**Success Response (200 OK):**

```json
{
  "id": 1,
  "title": "Complete and review project documentation",
  "description": "Write comprehensive API documentation and get it reviewed",
  "status": "in_progress",
  "createdAt": "2026-02-20T10:30:00.000Z",
  "updatedAt": "2026-02-20T12:00:00.000Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - No fields provided
{
  "message": "At least one field (title, description, or status) must be provided for update"
}

// 400 Bad Request - Invalid ID format
{
  "message": "Invalid task ID"
}

// 400 Bad Request - Validation error
{
  "message": "Title must not exceed 200 characters"
}

// 404 Not Found - Task doesn't exist
{
  "message": "Task with ID 999 not found"
}
```

**Notes:**

- This is a partial update (PATCH) - only fields provided in the request body are updated
- The `updatedAt` timestamp is automatically updated
- The `id` and `createdAt` fields cannot be modified

---

### 5. Delete Task

Delete a task from the system.

**Endpoint:** `DELETE /api/tasks/:id`

**URL Parameters:**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | number | Yes      | The unique identifier of the task |

**Example Request:**

```
DELETE /api/tasks/1
```

**Success Response (200 OK):**

```json
{
  "message": "Task deleted successfully",
  "task": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the task management system",
    "status": "completed",
    "createdAt": "2026-02-20T10:30:00.000Z",
    "updatedAt": "2026-02-20T12:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid ID format
{
  "message": "Invalid task ID"
}

// 404 Not Found - Task doesn't exist
{
  "message": "Task with ID 999 not found"
}
```

**Notes:**

- Returns the deleted task object in the response
- Once deleted, the task cannot be recovered (in-memory storage)

---

## HTTP Status Codes

| Status Code               | Description                   | Used For                              |
| ------------------------- | ----------------------------- | ------------------------------------- |
| 200 OK                    | Request successful            | GET, PATCH, DELETE operations         |
| 201 Created               | Resource created successfully | POST operation                        |
| 400 Bad Request           | Invalid request data          | Validation errors, invalid parameters |
| 404 Not Found             | Resource not found            | Task with specified ID doesn't exist  |
| 500 Internal Server Error | Server error                  | Unexpected server errors              |

---

## Error Response Format

All error responses follow a consistent format:

```json
{
  "message": "Error description"
}
```

For validation errors, the message will clearly indicate which field failed validation and why.

---

## Validation Rules Summary

### Task Title

- **Required** for creation
- Must be a non-empty string
- Maximum length: 200 characters
- Cannot contain only whitespace

### Task Description

- **Optional**
- Must be a string if provided
- Maximum length: 1000 characters
- Can be empty string

### Task Status

- **Required** for creation
- Must be one of the following values:
  - `pending`
  - `in_progress`
  - `completed`
- Case-sensitive

---

## Example Usage

### cURL Examples

#### Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn TypeScript",
    "description": "Complete TypeScript tutorial",
    "status": "pending"
  }'
```

#### Get All Tasks

```bash
curl http://localhost:5000/api/tasks
```

#### Get Tasks by Status

```bash
curl http://localhost:5000/api/tasks?status=pending
```

#### Get Single Task

```bash
curl http://localhost:5000/api/tasks/1
```

#### Update Task

```bash
curl -X PATCH http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

#### Delete Task

```bash
curl -X DELETE http://localhost:5000/api/tasks/1
```

### JavaScript (Fetch API) Examples

#### Create a Task

```javascript
const response = await fetch("http://localhost:5000/api/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Learn TypeScript",
    description: "Complete TypeScript tutorial",
    status: "pending",
  }),
});
const task = await response.json();
console.log(task);
```

#### Get All Tasks

```javascript
const response = await fetch("http://localhost:5000/api/tasks");
const tasks = await response.json();
console.log(tasks);
```

#### Update Task

```javascript
const response = await fetch("http://localhost:5000/api/tasks/1", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    status: "completed",
  }),
});
const updatedTask = await response.json();
console.log(updatedTask);
```

---

## Data Storage

- **Type:** In-memory storage
- **Persistence:** Data is **not** persisted between server restarts
- **ID Generation:** Auto-incrementing integers starting from 1
- **Concurrency:** No locking mechanism (single-threaded Node.js)

**Note:** All data will be lost when the server is restarted or stopped.

---

## Architecture

### Project Structure

```
backend/src/
├── models/
│   └── task.model.ts          # Task interface, enum, and in-memory CRUD operations
├── controllers/
│   └── task.controller.ts     # Request handlers for all endpoints
├── routes/
│   └── task.routes.ts         # Route definitions and middleware mapping
├── middleware/
│   ├── validation.ts          # Input validation middleware
│   └── errorHandler.ts        # Centralized error handling
├── app.ts                     # Express app configuration
└── server.ts                  # Server initialization
```

### Request Flow

1. **Request** → Express Router (`task.routes.ts`)
2. **Validation Middleware** → (`validation.ts`) validates input
3. **Controller** → (`task.controller.ts`) processes business logic
4. **Model** → (`task.model.ts`) performs CRUD operations on in-memory data
5. **Response** → JSON response sent back to client
6. **Error Handling** → Any errors caught by centralized error handler (`errorHandler.ts`)

---

## Best Practices

### When Creating Tasks

- Always provide a meaningful title
- Use descriptive descriptions when tasks are complex
- Set initial status to `pending` for new tasks

### When Updating Tasks

- Only send fields that need to be updated
- Update status as work progresses (`pending` → `in_progress` → `completed`)

### When Filtering Tasks

- Use status filter to get tasks in specific states
- Filter by `in_progress` to see active work
- Filter by `completed` for completed work tracking

### Error Handling

- Always check response status codes
- Handle 404 errors for get/update/delete operations
- Validate input on client side before sending to reduce 400 errors

---

## Future Enhancements (Not Implemented)

The following features could be added in future versions:

- Database persistence (MongoDB, PostgreSQL, etc.)
- Authentication and authorization
- Task assignment to users
- Task priority levels
- Due dates and reminders
- Task categories/tags
- Pagination and sorting
- Search functionality
- Task comments and activity logs
- Bulk operations
- Task relationships (parent/subtasks)

---

## Support

For issues or questions regarding the API, please contact the development team or refer to the source code in the backend repository.

---

**Version:** 1.0.0  
**Last Updated:** February 20, 2026  
**Maintainer:** Development Team
