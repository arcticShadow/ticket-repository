# 011. Testing Strategy and Scope

**Classifications:** development-workflow, concurrency

## Status

Implicitly required

## Context

The application must demonstrate that concurrency handling works correctly, particularly for preventing overselling. Testing strategy needs to validate the core requirement while fitting within time constraints.

## Decision

Use BATS (Bash Automated Testing System) exclusively to validate overselling prevention and core business functionality through API integration tests.

### Testing Approach
- **BATS only:** End-to-end API testing to demonstrate concurrency handling
- **Focus areas:** Overselling prevention, ticket purchasing workflows
- **Validation method:** Direct API calls with curl to simulate real user behavior
- **Concurrency testing:** Parallel requests to prove ticket limits are enforced

### BATS Implementation Strategy
BATS tests will validate:
- Ticket purchasing under normal conditions
- Concurrency handling (multiple simultaneous purchases)
- Error responses for overselling attempts
- Database state consistency after concurrent operations

Example core test:
```bash
@test "concurrent ticket purchases prevent overselling" {
  # Create event with 10 tickets
  event_id=$(curl -s -X POST localhost:3000/events \
    -d '{"name":"Test","totalTickets":10}' | jq -r '.id')
  
  # Launch 20 concurrent purchase attempts
  for i in {1..20}; do
    curl -s -X POST "localhost:3000/events/$event_id/tickets" &
  done
  wait
  
  # Verify exactly 10 tickets sold
  remaining=$(curl -s "localhost:3000/events/$event_id" | jq -r '.availableTickets')
  [ "$remaining" -eq 0 ]
}
```

## Consequences

### Constraints 
- Must demonstrate concurrency handling prevents overselling
- BATS tests validate core business logic through API endpoints
- Testing approach must be easily runnable and demonstrable
- Time constraints favor simple, focused testing approach
- Tests require running application and database locally
- All validation done through external API calls (black-box testing)

### Dependencies
- BATS framework installation and bash environment
- curl and jq tools for API calls and JSON parsing
- Running NestJS application with database connectivity
- Consistent API response formats for reliable parsing
- Database cleanup/reset capabilities between test runs

### Risk Level
High - Testing is required to demonstrate the core evaluation criteria

### Reversibility
Easy - Testing can be expanded without affecting application logic

### Other Considered Options
- **Jest unit tests** - Would test internal logic but not demonstrate real concurrency behavior
- **Postman/Newman collections** - Good for API testing but lacks bash scripting flexibility for concurrency
- **Custom Node.js test scripts** - More complex than BATS, unnecessary overhead
- **Manual testing only** - Not sufficient to demonstrate concurrency handling reliably
- **Load testing tools (Artillery, k6)** - Overkill for assessment scope, harder to validate exact counts 