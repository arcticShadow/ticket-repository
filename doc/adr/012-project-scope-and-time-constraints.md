# 012. Project Scope and Time Constraint Management

**Classifications:** development-workflow, business-rules

## Status

Explicitly stated

## Context

The specification provides a 3-4 hour time limit with clear priorities: "If you run out of time, prioritize a working solution for concurrency and event creation." This defines the minimum viable scope.

## Decision

Prioritize core functionality (event creation and concurrency-safe ticket purchasing) over additional features, with clear scope boundaries to fit time constraints.

## Consequences

### Constraints 
- Maximum 3-4 hours development time
- Core priority: working concurrency solution and event creation
- Secondary priority: event listing and viewing
- Acceptable to leave improvement notes for future work
- Must deliver functional demonstration of requirements

### Dependencies
- Affects all other technical decisions and implementation complexity
- Influences testing scope and documentation depth
- Impacts technology choices favoring rapid development

### Risk Level
High - Time constraints directly affect deliverable quality and scope

### Reversibility
N/A - Time constraints are fixed for assessment period

### Other Considered Options
- **Full-featured ticketing system** - Not feasible within time constraints
- **Minimal proof-of-concept only** - May not demonstrate sufficient engineering depth
- **Focus on UI polish over functionality** - Explicitly discouraged in specification 