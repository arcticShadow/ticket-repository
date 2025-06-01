# 006. Data Model and Schema Design

**Classifications:** data-modeling, business-rules

## Status

Implicitly required

## Context

The application requires data models for events and ticket purchases. Events need name, date, and total tickets available. The system must track ticket purchases and remaining availability.

## Decision

Implement a minimal relational schema with Events and Tickets/Purchases tables, focusing on data integrity for concurrency control.

## Consequences

### Constraints 
- Events must store: name (string), date (datetime), total_tickets (integer)
- Need to track purchased tickets and calculate remaining availability
- Schema must support atomic operations for ticket purchasing
- Foreign key relationships required for data integrity

### Dependencies
- Directly impacts concurrency handling implementation
- Affects API response structures and validation rules
- Influences database migration and seeding strategies

### Risk Level
Medium - Core data structure affects all application functionality

### Reversibility
Moderate - Schema changes require migrations and potential data transformation

### Other Considered Options
- **Single table with ticket count** - Simpler but harder to audit purchases
- **Separate tickets table with individual ticket records** - More detailed tracking, higher storage overhead
- **Event-sourcing approach** - Overkill for assessment scope
- **Denormalized ticket counts** - Risk of data inconsistency 