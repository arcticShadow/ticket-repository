# 003 Implement Event Management API

## Dependencies
- 001: Setup Project Infrastructure
- 002: Design and Implement Database Schema
- ADR-001: Backend Technology Stack
- ADR-007: API Design Patterns

## Description
Implement REST API endpoints for creating, retrieving, and listing events. These endpoints will allow users to create new events with ticket availability and view existing events.

## Technical Requirements
- Implement NestJS controllers and services for event management
- Create DTO (Data Transfer Object) classes with validation using class-validator
- Implement CRUD operations for events
- Implement proper error handling with appropriate HTTP status codes:
  - 201 Created: Successful event creation
  - 200 OK: Successful GET requests
  - 400 Bad Request: Invalid input data
  - 404 Not Found: Event not found
  - 500 Internal Server Error: Server-side errors
  - 422 Unprocessable Entity: Validation errors
  - 409 Conflict: Duplicate event name/date
- Follow RESTful API conventions as defined in ADR-007

## Specific test cases required
- Event creation with valid data returns 201 Created
- Event creation with invalid data returns 400 Bad Request
- Get single event returns correct event data
- List events returns paginated results
- Event dates are properly formatted in responses

## Acceptance Criteria
- [ ] POST /events endpoint creates a new event with name, date, and total tickets
- [ ] GET /events endpoint lists all events with pagination
- [ ] GET /events/:id endpoint retrieves a specific event with ticket availability
- [ ] Input validation rejects invalid event data (missing fields, invalid dates)
- [ ] API responses follow the format defined in ADR-007
- [ ] Events are persisted in the database
- [ ] Tests passing

## Implementation Notes
- Use NestJS decorators for route definitions
- Use class-validator for DTO validation
- Implement proper error handling with custom exception filters
- Return ticket availability in event responses
- Follow JSON response format from ADR-007
- Consider adding filtering and sorting options for the list endpoint
- Use TypeORM repository pattern for database operations

## Documentation Requirements:
- [ ] Update API documentation with event endpoints
- [ ] Document request/response formats for each endpoint 