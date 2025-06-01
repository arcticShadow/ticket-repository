# BATS Tests for Flicket

This directory contains BATS (Bash Automated Testing System) tests for the Flicket application.

## Prerequisites

- [BATS](https://github.com/bats-core/bats-core) - Available through `mise`
- [jq](https://stedolan.github.io/jq/) - JSON processor for parsing API responses
- [curl](https://curl.se/) - HTTP client for making API requests

## Test Structure

- `api/` - Tests for the REST API endpoints
- `helpers/` - Common helper functions and utilities
- `fixtures/` - Test data and fixtures

## Running Tests

To run all tests:

```bash
./run-tests.sh
```

To run a specific test file:

```bash
./run-tests.sh api/events.bats
```

## Adding New Tests

1. Create a new `.bats` file in the appropriate directory
2. Load the common helper functions: `load "../helpers/common.bash"`
3. Implement your tests using the BATS syntax

Example:

```bash
#!/usr/bin/env bats

load "../helpers/common.bash"

setup() {
  setup_environment
}

teardown() {
  teardown_environment
}

@test "Example test" {
  run some_command
  [ "$status" -eq 0 ]
  [ "$output" = "expected output" ]
}
```

## Test Dependencies

The test runner script will automatically:

1. Check if the API server is running
2. Start the API server if it's not running
3. Run the specified tests
4. Shut down the API server if it was started by the test runner

## Best Practices

- Each test should be independent and not rely on the state from previous tests
- Use the helper functions in `common.bash` for common operations
- Clean up any test data created during the test in the `teardown` function
- Add descriptive names to your tests to make failures easier to understand 