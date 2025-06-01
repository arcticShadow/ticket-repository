# 004. Concurrency Handling Strategy for Ticket Purchasing

**Classifications:** concurrency, business-rules

## Status

Implicitly required

## Context

The core requirement is preventing overselling when multiple users purchase tickets concurrently. This is the primary technical challenge and evaluation criteria for the application. The system must handle scenarios like 2000 concurrent users trying to purchase 100 available tickets.

## Decision

Implement database-level concurrency control using PostgreSQL row-level locking with transactions.

### Technical Implementation

**Database Approach (Selected):**
- Use `SELECT FOR UPDATE` to lock event rows during ticket purchase
- Wrap purchase logic in database transactions
- Leverage PostgreSQL's ACID properties for consistency

**Flow for Concurrent Purchases:**
1. Start database transaction
2. Lock event row: `SELECT available_tickets FROM events WHERE id = ? FOR UPDATE`
3. Check ticket availability: `available_tickets > 0`
4. Decrement counter: `UPDATE events SET available_tickets = available_tickets - 1`
5. Create purchase record: `INSERT INTO purchases (...)`
6. Commit transaction (releases lock)

**Concurrency Behavior:**
- Only one transaction can hold the row lock at a time
- PostgreSQL automatically queues waiting transactions
- Failed purchases (when sold out) receive clear error responses
- Guarantees exactly the correct number of sales

Other considerations to this approach: The ticket needs to be assigned to an allocation table - and the user has a period of time to complete the transaction (i.e. pay for it) else the allocation returns to the pool





## Consequences

### Constraints 
- Must guarantee no overselling under concurrent load
- Solution must be demonstrable and testable
- Performance impact should be reasonable for the scope
- Implementation complexity should fit within 3-4 hour time limit
- Sequential processing of purchases (acceptable for assessment scope)

### Dependencies
- Directly tied to PostgreSQL transaction capabilities
- Affects API endpoint design and error handling patterns
- Impacts testing strategy and load testing requirements

### Risk Level
High - This is the primary evaluation criteria and core business requirement

### Reversibility
Moderate - Can switch to application-level approaches but requires significant refactoring

### Other Considered Options
**Application-Level Approaches:**

#### 1. Optimistic Locking with Version Fields
- Add `version` field to events table
- Read event with current version: `{id: 1, available_tickets: 100, version: 5}`
- Update with version check: `UPDATE events SET available_tickets = available_tickets - 1, version = version + 1 WHERE id = ? AND version = 5`
- If another transaction updated first, version mismatch causes 0 rows affected = conflict detected
- Requires retry logic and conflict resolution in application code
- **Pros:** Better performance under low contention, no blocking
- **Cons:** More complex error handling, requires retry mechanisms

#### 2. Application-Level Queuing/Semaphores
- Use in-memory structures (Redis, Node.js Map) to control access per event
- Acquire distributed lock before purchase operations
- Example: `redis.set('event_lock:123', 'locked', 'PX', 5000, 'NX')`
- Only one purchase operation per event at a time across all servers
- **Pros:** Fine-grained control, configurable timeouts, scales across instances
- **Cons:** Adds infrastructure dependency (Redis), more complex failure scenarios

#### 3. Event Sourcing Approach
- Append events to log instead of updating counts: `TicketReserved`, `TicketPurchased`, `TicketReleased`
- Calculate current state by replaying event stream
- Natural handling of temporary reservations and audit trails
- **Pros:** Complete audit trail, handles complex reservation workflows
- **Cons:** Significant complexity increase, overkill for assessment scope

**Note:** Application-level approaches provide more control but require handling edge cases manually, while database-level approaches leverage PostgreSQL's battle-tested transaction system.