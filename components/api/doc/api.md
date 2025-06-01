# Event Management API Documentation

This document provides details about the event management API endpoints.

## API Endpoints

### Create Event

Creates a new event with specified details.

- **URL**: `/events`
- **Method**: `POST`
- **Auth required**: No

#### Request Body

```json
{
  "name": "Summer Concert 2024",
  "date": "2024-07-15T19:00:00Z",
  "totalTickets": 100
}
```

| Field        | Type   | Description                                    | Required |
|--------------|--------|------------------------------------------------|----------|
| name         | string | The name of the event                          | Yes      |
| date         | string | ISO 8601 date string (YYYY-MM-DDThh:mm:ssZ)    | Yes      |
| totalTickets | number | Total number of tickets available for the event | Yes      |

#### Responses

**Success Response (201 Created)**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Summer Concert 2024",
  "date": "2024-07-15T19:00:00Z",
  "totalTickets": 100,
  "allocatedTickets": 0,
  "availableTickets": 100,
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Error Responses**

- **400 Bad Request**: Invalid input data
  ```json
  {
    "error": "Validation failed",
    "code": "BAD_REQUEST",
    "details": [
      { "field": "name", "message": "name should not be empty" }
    ]
  }
  ```

- **409 Conflict**: Event with same name and date already exists
  ```json
  {
    "error": "Event with this name and date already exists",
    "code": "CONFLICT"
  }
  ```

### List Events

Retrieves a paginated list of events.

- **URL**: `/events`
- **Method**: `GET`
- **Auth required**: No

#### Query Parameters

| Parameter | Type   | Description                     | Required | Default |
|-----------|--------|---------------------------------|----------|---------|
| page      | number | Page number (starts from 1)     | No       | 1       |
| limit     | number | Number of items per page        | No       | 10      |

#### Responses

**Success Response (200 OK)**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Summer Concert 2024",
      "date": "2024-07-15T19:00:00Z",
      "totalTickets": 100,
      "allocatedTickets": 0,
      "availableTickets": 100,
      "createdAt": "2024-01-15T12:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Fall Festival 2024",
      "date": "2024-09-20T18:00:00Z",
      "totalTickets": 200,
      "allocatedTickets": 50,
      "availableTickets": 150,
      "createdAt": "2024-01-16T10:30:00Z",
      "updatedAt": "2024-01-16T10:30:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### Get Event by ID

Retrieves a specific event by its ID.

- **URL**: `/events/:id`
- **Method**: `GET`
- **Auth required**: No

#### URL Parameters

| Parameter | Type   | Description                     | Required |
|-----------|--------|---------------------------------|----------|
| id        | string | The UUID of the event to fetch  | Yes      |

#### Responses

**Success Response (200 OK)**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Summer Concert 2024",
  "date": "2024-07-15T19:00:00Z",
  "totalTickets": 100,
  "allocatedTickets": 0,
  "availableTickets": 100,
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Error Response**

- **404 Not Found**: Event with the specified ID doesn't exist
  ```json
  {
    "error": "Event with ID \"123e4567-e89b-12d3-a456-426614174999\" not found",
    "code": "NOT_FOUND"
  }
  ```

## Error Codes

| Code                 | HTTP Status | Description                                    |
|----------------------|-------------|------------------------------------------------|
| BAD_REQUEST          | 400         | Invalid input data                             |
| NOT_FOUND            | 404         | Resource not found                             |
| CONFLICT             | 409         | Resource already exists                        |
| VALIDATION_ERROR     | 422         | Validation error                               |
| INTERNAL_SERVER_ERROR| 500         | Server error                                   | 