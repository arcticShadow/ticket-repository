# 002 Design and Implement Database Schema

## Dependencies
- 001: Setup Project Infrastructure
- ADR-003: Database Technology Selection
- ADR-006: Data Model Design

## Description
Design and implement the database schema for the ticketing system, including tables for events, tickets, and allocations. This schema will support the core functionality of event creation and ticket purchasing while enabling proper concurrency control.

## Technical Requirements
- Design database schema with proper relations between entities
- Implement entity models in TypeORM
- Create migration files for database setup
- Include indexes for performance optimization
- Implement schema that supports concurrency control requirements

## Specific test cases required
- Database migrations run successfully
- Entity relationships are correctly established
- Indexes are created for performance-critical queries
- Schema supports the concurrency control pattern from ADR-004

## Acceptance Criteria
- [ ] Events table is created with name, date, and total_tickets fields
- [ ] Ticket allocations table is created to track reserved/purchased tickets
- [ ] Schema includes constraints to prevent overselling
- [ ] TypeORM entity models match the database schema
- [ ] Migration files are created and can be run in the 'up'  direction (down is a bonus but not required)
- [ ] Database indexes are created for frequently queried fields
- [ ] Tests passing

## Implementation Notes
- Follow ADR-006 for data model design principles
- Use TypeORM decorators for entity definitions
- Use PostgreSQL-specific features for concurrency control (FOR UPDATE)
- Create separate migrations for each major schema change
- Consider adding a "status" field to track ticket allocation state (reserved, purchased, expired)
- Create unique fingerprint for user identification (since no authentication required)
- Include timestamps (created_at, updated_at) for auditing purposes

## Documentation Requirements:
- [ ] Update README.md with database schema information
- [ ] Document entity relationships in schema.md 