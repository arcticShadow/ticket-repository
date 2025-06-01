#!/usr/bin/env bats

# Load common helper functions
load "../helpers/common.bash"

setup() {
	setup_environment
}

teardown() {
	teardown_environment
}

@test "API health check is working" {
	run wait_for_api 5
	[ "$status" -eq 0 ]
}

# bats test_tags=event:create

@test "Can create a new event" {
	# Create a test event
	response=$(create_event "Test Concert" "2024-12-31T23:59:59Z" 100)

	# Check response
	name=$(json_value "$response" '.name')
	[[ "$name" =~ ^Test\ Concert-[a-f0-9]{8}$ ]]
	[ "$(json_value "$response" '.totalTickets')" -eq 100 ]
	[ "$(json_value "$response" '.allocatedTickets')" -eq 0 ]
	[ "$(json_value "$response" '.availableTickets')" -eq 100 ]

	# Save event ID for later tests
	event_id=$(json_value "$response" '.id')
	[ -n "$event_id" ]
}

@test "Can retrieve an event by ID" {
	# First create an event
	create_response=$(create_event "Get Event Test" "2024-11-15T20:00:00Z" 50)
	event_id=$(json_value "$create_response" '.id')
	expected_name=$(json_value "$create_response" '.name')

	# Get the event
	response=$(get_event "$event_id")

	# Check response
	[ "$(json_value "$response" '.id')" = "$event_id" ]
	[ "$(json_value "$response" '.name')" = "$expected_name" ]
	[ "$(json_value "$response" '.totalTickets')" -eq 50 ]
}

@test "Can list events with pagination" {
	# Create multiple events
	create_event "Event 1" "2024-05-01T12:00:00Z" 100
	create_event "Event 2" "2024-06-01T12:00:00Z" 200
	create_event "Event 3" "2024-07-01T12:00:00Z" 300

	# List events with pagination (limit 2)
	response=$(list_events 1 2)

	# Check pagination
	[ "$(json_value "$response" '.meta.limit')" -eq 2 ]
	[ "$(json_value "$response" '.meta.page')" -eq 1 ]

	# Check that we have data
	data_length=$(json_value "$response" '.data | length')
	[ "$data_length" -le 2 ]
	[ "$data_length" -gt 0 ]
}

@test "Returns 404 for non-existent event" {
	# Try to get a non-existent event
	run api_request "GET" "/events/99999999-9999-9999-9999-999999999999" "" "-o /dev/null -w %{http_code}"

	[ "$output" -eq 404 ]
}

@test "Cannot create event with invalid data" {
	# Try to create an event with invalid data
	run api_request "POST" "/events" '{"name":"Invalid Event","totalTickets":-5}' "-o /dev/null -w %{http_code}"

	[ "$output" -eq 400 ]
}
