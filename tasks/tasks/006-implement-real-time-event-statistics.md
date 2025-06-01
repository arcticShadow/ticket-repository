# 006 Implement Real-time Event Statistics

## Dependencies

- 004: Implement Ticket Purchase with Concurrency Control
- 005: Implement Payment Confirmation Flow
- ADR-007: API Design Patterns

## Description

Implement a real-time event statistics stream using Server-Sent Events (SSE) to provide live updates on ticket availability, allocations, and purchases for each event.

## Technical Requirements

- Implement SSE endpoint for real-time statistics
- Create event emitter system for ticket status changes
- Track and broadcast statistics about remaining, allocated, and confirmed tickets
- Ensure proper connection handling and reconnection support
- Follow the streaming data format specified in ADR-007

## Specific test cases required

- SSE connection can be established successfully
- Ticket purchase events trigger statistics updates
- Payment confirmation events trigger statistics updates
- Cancelled/expired ticket events trigger statistics updates
- SSE format matches the specified format in ADR-007

## Acceptance Criteria

- [ ] GET /events/:id/stream endpoint provides SSE stream of statistics
- [ ] Statistics include totalTickets, remainingTickets, allocatedTickets, and confirmedTickets
- [ ] Statistics update in real-time when ticket status changes
- [ ] Stream includes information about the last event (type and actor)
- [ ] Proper error handling for connection issues
- [ ] Reconnection support in case of disconnection
- [ ] Tests passing

## Implementation Notes

- Use NestJS SSE module (@nestjs/event-emitter and @Sse() decorator)
- Create a pub/sub mechanism to notify the SSE endpoint when ticket status changes
- Format SSE events according to the specification in ADR-007
- Include timestamps with each SSE message
- Consider performance implications and optimize for high concurrent connections
- Ensure proper cleanup of SSE connections when clients disconnect
- Track statistics in an efficient way to avoid database overload

## Documentation Requirements:

- [ ] Document SSE endpoint and connection details
- [ ] Provide examples of SSE message format
- [ ] Update API documentation with streaming endpoint
