# Epic: EPICT-001. Ticketing System MVP

## Epic Summary
**Epic ID**: EPICT-001  
**Priority**: High  

## Business Context
**Problem Statement**: Users need a simple platform to create events and purchase tickets for those events, with a focus on handling concurrent ticket purchases without overselling.  
**Business Value**: Enables organizers to create events and manage ticket sales while ensuring users can purchase tickets with confidence that the system won't oversell.  
**Success Metrics**:  
- Zero instances of overselling tickets even under concurrent load
- Event creation and ticket purchasing flows completed within expected timeframes
- System correctly handles edge cases (sold out events, invalid purchases)

## Technical Scope
**System Components**:  
- Backend API (Node.js/TypeScript)
- Frontend UI (React/TypeScript)
- PostgreSQL Database
- Concurrency control mechanism

**Performance Requirements**:  
- Must handle concurrent ticket purchase requests without overselling
- Response times should remain reasonable even under load
- No database deadlocks during concurrent operations

## Architecture Decision Records
**Required ADRs**:  
- [ ] ADR-001: Backend Technology Stack
- [ ] ADR-002: Frontend Technology Stack
- [ ] ADR-003: Database Technology Selection
- [ ] ADR-004: Concurrency Handling Strategy
- [ ] ADR-006: Data Model Design
- [ ] ADR-007: API Design Patterns
- [ ] ADR-008: Error Handling Strategy
- [ ] ADR-009: UI Component Library Approach
- [ ] ADR-011: Testing Strategy and Scope

## Epic Acceptance Criteria
- [ ] Users can create events with name, date, and total tickets available
- [ ] Users can view a list of all events
- [ ] Users can view details of a single event
- [ ] Users can purchase tickets for an event
- [ ] System prevents overselling tickets when multiple users attempt purchases concurrently
- [ ] System provides appropriate error messages when tickets are sold out
- [ ] Frontend UI displays events and enables ticket purchases
- [ ] System can be run and demonstrated locally

## Definition of Done
- [ ] All tasks completed and tested
- [ ] Documentation updated (markdown only)
- [ ] Performance requirements met (no overselling under concurrent load)
- [ ] Security review completed (even though authentication not required)
- [ ] Stakeholder acceptance obtained

## Dependencies
**Blocking Dependencies**:  
- Database schema design must be completed before API implementation
- Concurrency handling strategy must be implemented before ticket purchasing functionality

**Parallel Dependencies**:  
- Frontend development can proceed in parallel with backend API development
- Event creation API can be developed in parallel with ticket purchasing API

**External Dependencies**:  
- None (local development only)

## Notes
This is a technical assessment with a strict time limit of 3-4 hours. Focus should be on implementing the core functionality (event creation and concurrent ticket purchasing) rather than polish or extended features. The concurrency handling for ticket purchases is the primary technical challenge.

Key trade-offs and assumptions:
- No authentication required
- Simple UI using off-the-shelf component library
- Basic error handling only
- No role-based access control
- No admin panel
- No deployment requirements

## Related Documents
- Specification Document: [doc/task.txt](../../doc/task.txt)
- ADR Documents:
  - [doc/adr/001-backend-technology-stack.md](../../doc/adr/001-backend-technology-stack.md)
  - [doc/adr/002-frontend-technology-stack.md](../../doc/adr/002-frontend-technology-stack.md)
  - [doc/adr/003-database-technology-selection.md](../../doc/adr/003-database-technology-selection.md)
  - [doc/adr/004-concurrency-handling-strategy.md](../../doc/adr/004-concurrency-handling-strategy.md)
  - [doc/adr/006-data-model-design.md](../../doc/adr/006-data-model-design.md)
  - [doc/adr/007-api-design-patterns.md](../../doc/adr/007-api-design-patterns.md)
  - [doc/adr/008-error-handling-strategy.md](../../doc/adr/008-error-handling-strategy.md)
  - [doc/adr/009-ui-component-library-approach.md](../../doc/adr/009-ui-component-library-approach.md)
  - [doc/adr/011-testing-strategy-and-scope.md](../../doc/adr/011-testing-strategy-and-scope.md)

