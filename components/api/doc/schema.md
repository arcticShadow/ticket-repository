# Database Schema Documentation

## Overview
The database schema implements a ticketing system for events, with concurrency control to prevent overselling tickets. PostgreSQL is used as the database management system, taking advantage of its ACID compliance and row-level locking capabilities.

## Entities

### Events
Stores information about available events.

| Column             | Type                    | Description                           |
|--------------------|-------------------------|---------------------------------------|
| id                 | UUID                    | Primary key                           |
| name               | VARCHAR                 | Event name                            |
| date               | TIMESTAMP WITH TIME ZONE| Date and time of the event            |
| total_tickets      | INTEGER                 | Total number of tickets for the event |
| allocated_tickets  | INTEGER                 | Number of tickets currently allocated |
| created_at         | TIMESTAMP WITH TIME ZONE| Record creation timestamp             |
| updated_at         | TIMESTAMP WITH TIME ZONE| Record last update timestamp          |

#### Computed Values
- `availableTickets`: Calculated as `totalTickets - allocatedTickets` (not stored in database)

### Ticket Allocations
Tracks ticket allocations (reservations and purchases) for events.

| Column             | Type                    | Description                           |
|--------------------|-------------------------|---------------------------------------|
| id                 | UUID                    | Primary key                           |
| event_id           | UUID                    | Foreign key to events table           |
| user_fingerprint   | VARCHAR                 | Unique identifier for the user        |
| status             | ENUM                    | 'reserved', 'purchased', or 'expired' |
| expires_at         | TIMESTAMP WITH TIME ZONE| Expiration time for reserved tickets  |
| created_at         | TIMESTAMP WITH TIME ZONE| Record creation timestamp             |
| updated_at         | TIMESTAMP WITH TIME ZONE| Record last update timestamp          |

#### Status Values
- `RESERVED`: Ticket is temporarily allocated but not yet purchased
- `PURCHASED`: Ticket has been successfully purchased
- `EXPIRED`: Reservation has expired and ticket is available again

## Relationships
- Each `Event` can have multiple `TicketAllocation` records (one-to-many)
- Each `TicketAllocation` belongs to exactly one `Event` (many-to-one)

## Indexes
For performance optimization, the following indexes are implemented:

| Table              | Index Name                                    | Columns                    |
|--------------------|-----------------------------------------------|----------------------------|
| ticket_allocations | idx_ticket_allocations_user_fingerprint_status| user_fingerprint, status   |
| ticket_allocations | idx_ticket_allocations_event_id               | event_id                   |
| ticket_allocations | idx_ticket_allocations_status                 | status                     |
| ticket_allocations | idx_ticket_allocations_expires_at             | expires_at                 |

## Concurrency Control
The database schema supports concurrency control through:
1. Row-level locking with PostgreSQL's `FOR UPDATE` clause
2. Database transactions for atomic operations
3. Check for available tickets before allocation

This prevents overselling by ensuring that only one transaction can modify an event's ticket count at a time.

## Migration Strategy
Migrations are managed through TypeORM's migration system:
- Initial migration creates tables, enums, and indexes
- Additional migrations will be created for each schema change
- Both 'up' and 'down' migrations are provided for rollback capability 