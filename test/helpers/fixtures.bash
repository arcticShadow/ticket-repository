#!/usr/bin/env bash

# Get the path to the fixtures directory
FIXTURES_DIR="$(dirname "$(dirname "$BATS_TEST_FILENAME")")/fixtures"

# Load a fixture file
load_fixture() {
	local file="$1"
	cat "$FIXTURES_DIR/$file"
}

# Create events from fixture
create_events_from_fixture() {
	local fixture="$1"
	local events=$(load_fixture "$fixture")

	# Create each event
	echo "$events" | jq -c '.[]' | while read -r event; do
		local name=$(echo "$event" | jq -r '.name')
		local date=$(echo "$event" | jq -r '.date')
		local totalTickets=$(echo "$event" | jq -r '.totalTickets')

		create_event "$name" "$date" "$totalTickets" >/dev/null
	done
}

# Clean events from a fixture
cleanup_events_from_fixture() {
	local fixture="$1"
	local events=$(load_fixture "$fixture")

	# For future implementation: API call to delete events created during tests
	# This would require a DELETE endpoint for events
	:
}
