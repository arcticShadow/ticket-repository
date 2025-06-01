# 004 Implement Ticket Purchase with Concurrency Control

## Dependencies

- 002: Design and Implement Database Schema
- 003: Implement Event Management API
- ADR-004: Concurrency Handling Strategy
- ADR-011: Testing Strategy

## Description

Implement the ticket purchasing functionality with proper concurrency control to prevent overselling of tickets. This is the core technical challenge of the application and must ensure that tickets are not oversold even under high concurrent load.

## Technical Requirements

- Implement ticket purchase API endpoint
- Apply database-level concurrency control using row-level locking
- Handle edge cases like sold-out events
- Create proper error responses for failed purchases
- Track ticket allocation status (reserved, purchased, expired)

## Specific test cases required

- Concurrent purchase requests do not result in overselling
- Attempting to purchase more tickets than available returns appropriate error
- Ticket purchase deducts from available ticket count
- Ticket allocation with status tracking works correctly
- Expired ticket allocations are handled properly

## Acceptance Criteria

- [x] POST /events/:id/tickets endpoint creates a ticket allocation with proper status
- [x] Concurrency control prevents overselling tickets
- [x] Database transactions maintain data consistency
- [x] Proper error responses when tickets are sold out (409 Conflict)
- [x] Ticket purchase flow handles reservation, payment, and confirmation states
- [x] System correctly identifies users without authentication (device fingerprinting)
- [x] Tests passing

## Implementation Notes

- Follow the transaction flow in ADR-004 for concurrency control:
  1. Start database transaction
  2. Lock event row with SELECT FOR UPDATE
  3. Check ticket availability
  4. Create ticket allocation with initial status
  5. Update available tickets count
  6. Commit transaction
- Use PostgreSQL's row-level locking capabilities
- Consider timeout handling for abandoned ticket reservations
- Implement fingerprinting logic to identify users without authentication
- Handle edge cases like transaction failures and rollbacks

## Documentation Requirements

- [x] Document concurrency control implementation details
- [x] Update API documentation with ticket purchase endpoint
- [x] Document error codes and response formats
