#!/usr/bin/env bats

# Load common helper functions
load "../helpers/common.bash"

setup() {
	setup_environment
}

teardown() {
	teardown_environment
}

# Helper function to run parallel requests
run_parallel_requests() {
	local count=$1
	local event_id=$2
	local output_file="$BATS_TEST_TMPDIR/parallel_output.txt"

	# Clear output file
	>"$output_file"

	# Run multiple requests in parallel
	for i in $(seq 1 $count); do
		{
			purchase_tickets "$event_id" 1 "user-$i" >>"$output_file" 2>&1
			echo "" >>"$output_file"
		} &
	done

	# Wait for all background processes to finish
	wait

	# Ensure each FAILED response is on its own line (Sed command is using darwin specific syntax)
	sed -i '' 's/}{/}\n{/g' "$output_file"
	# Ensure each SUCCESSFULL response is on its own line (Sed command is using darwin specific syntax)
	sed -i '' 's/\]\[/\]\n\[/g' "$output_file"
	# Ensure each SUCCESSFULL/FAILED response is on its own line (Sed command is using darwin specific syntax)
	sed -i '' 's/\]{/\]\n{/g' "$output_file"

	# Remove blank lines
	sed -i '' '/^$/d' "$output_file"

cp $output_file /tmp/
	# Return content of output file
	cat "$output_file"
}

@test "API can handle load and will not oversell" {
	# how many requests to throw at the api
	parallel_executions=2000
	total_event_tickets=100
	expected_fails=$(($parallel_executions-$total_event_tickets))


	# Create an event with more tickets
	response=$(create_event "Concurrency Test" "2024-10-01T18:00:00Z" $total_event_tickets)
	event_id=$(json_value "$response" '.id')
	

	# Run $parallel_executions parallel requests (much more than available tickets)
	results=$(run_parallel_requests $parallel_executions "$event_id")
	totalRequests=$(echo "$results" | wc -l)
	
	[ "$totalRequests" -eq "$parallel_executions" ] || {
		echo "Expected $parallel_executions requests but got $totalRequests"
	
	}

	# Count successful and failed responses
	successful=$(echo "$results" | grep -c '"status":"reserved"')
	failed=$(echo "$results" | tr '}' '\n' | grep -c '"error":"Not enough tickets available"')

	# Should have exactly $total_event_tickets successful allocations (the number of available tickets)
	[ "$successful" -eq $total_event_tickets ] || {
		echo "Expected $total_event_tickets successful allocations but got $successful"
		# slightly icky, retest to cause the test to throw after we output some debugging above. There is probably a better way to do this in bats
		[ "$successful" -eq $total_event_tickets ]
	}

	# check expected fails
	[ "$failed" -eq $expected_fails ]

	# Verify the event has no more available tickets
	event=$(get_event "$event_id")
	available=$(json_value "$event" '.availableTickets')
	[ "$available" -eq 0 ]
}

@test "API prevents overselling with when requesting large quantities" {
	# Create an event with limited tickets
	response=$(create_event "Oversell Test" "2024-10-01T18:00:00Z" 5)
	event_id=$(json_value "$response" '.id')

	# Try to purchase more tickets than available
	response=$(purchase_tickets "$event_id" 10 "user-1")

	# Should get an error response
	error=$(json_value "$response" '.error')
	[ "$error" = "Not enough tickets available" ]

	# Verify no tickets were allocated
	event=$(get_event "$event_id")
	available=$(json_value "$event" '.availableTickets')
	[ "$available" -eq 5 ]
}

@test "API handles ticket purchase flow correctly" {
	# Create an event
	response=$(create_event "Purchase Flow Test" "2024-10-01T18:00:00Z" 10)
	event_id=$(json_value "$response" '.id')

	# Purchase a ticket
	response=$(purchase_tickets "$event_id" 1 "user-1")
	
	# Should be in RESERVED state
	status=$(json_value "$response" '.[0].status')
	[ "$status" = "reserved" ]

	# Get allocation ID
	allocation_id=$(json_value "$response" '.[0].id')

	# Confirm the purchase
	response=$(confirm_ticket "$allocation_id" "user-1")
	echo "Confirm response: $response"
	
	# Should be in PURCHASED state
	status=$(json_value "$response" '.status')
	[ "$status" = "purchased" ]

	# Verify ticket count
	event=$(get_event "$event_id")
	available=$(json_value "$event" '.availableTickets')
	[ "$available" -eq 9 ]
}

@test "API handles expired ticket allocations" {
	# Create an event
	response=$(create_event "Expiration Test" "2024-10-01T18:00:00Z" 10)
	event_id=$(json_value "$response" '.id')

	# Purchase a ticket
	response=$(purchase_tickets "$event_id" 1 "user-1")
	
	# Get allocation ID
	allocation_id=$(json_value "$response" '.[0].id')

	# Expire the allocation using test endpoint
	expire_ticket "$allocation_id" > /dev/null

	# Try to confirm expired allocation
	response=$(confirm_ticket "$allocation_id" "user-1")
	echo "Expired confirm response: $response"
	
	# Should get an error response
	error=$(json_value "$response" '.error')
	[ "$error" = "Ticket allocation has expired" ]
}

@test "API handles payment cancellation correctly" {
	# Create an event
	response=$(create_event "Cancellation Test" "2024-10-01T18:00:00Z" 10)
	event_id=$(json_value "$response" '.id')

	# Purchase a ticket
	response=$(purchase_tickets "$event_id" 1 "user-1")
	
	# Get allocation ID
	allocation_id=$(json_value "$response" '.[0].id')

	# Cancel the purchase
	response=$(cancel_ticket "$allocation_id")
	
	# Should be in USER_CANCELLED state
	status=$(json_value "$response" '.status')
	[ "$status" = "user_cancelled" ]

	# Verify ticket count
	event=$(get_event "$event_id")
	available=$(json_value "$event" '.availableTickets')
	[ "$available" -eq 10 ]

	# Try to cancel again
	response=$(cancel_ticket "$allocation_id")
	error=$(json_value "$response" '.error')
	[ "$error" = "Can only cancel reserved tickets" ]
}

@test "API handles non-existent ticket allocation confirmation" {
	# Try to confirm a non-existent allocation
	response=$(confirm_ticket "00000000-0000-4000-8000-000000000000" "user-1")
	echo "Non-existent confirm response: $response"
	
	# Should get an error response
	error=$(json_value "$response" '.error')
	[ "$error" = "Ticket allocation not found" ]
}

@test "API handles already purchased ticket confirmation" {
	# Create an event
	response=$(create_event "Double Purchase Test" "2024-10-01T18:00:00Z" 10)
	event_id=$(json_value "$response" '.id')

	# Purchase a ticket
	response=$(purchase_tickets "$event_id" 1 "user-1")
	
	# Get allocation ID
	allocation_id=$(json_value "$response" '.[0].id')

	# Confirm the purchase
	response=$(confirm_ticket "$allocation_id" "user-1")
	echo "First confirm response: $response"
	
	# Should be in PURCHASED state
	status=$(json_value "$response" '.status')
	[ "$status" = "purchased" ]

	# Try to confirm again
	response=$(confirm_ticket "$allocation_id" "user-1")
	echo "Second confirm response: $response"
	
	# Should get an error response
	error=$(json_value "$response" '.error')
	[ "$error" = "Invalid allocation status" ]
}

@test "API prevents payment confirmation by different user" {
	# Create an event
	response=$(create_event "User Verification Test" "2024-10-01T18:00:00Z" 10)
	event_id=$(json_value "$response" '.id')

	# Purchase a ticket with user-1
	response=$(purchase_tickets "$event_id" 1 "user-1")
	
	# Get allocation ID
	allocation_id=$(json_value "$response" '.[0].id')

	# Try to confirm with user-2's fingerprint
	response=$(confirm_ticket "$allocation_id" "user-2")
	echo "Different user confirm response: $response"
	
	# Should get an error response
	error=$(json_value "$response" '.error')
	[ "$error" = "Invalid user fingerprint" ]

	# Verify ticket is still in RESERVED state
	response=$(get_ticket "$allocation_id")
	status=$(json_value "$response" '.status')
	[ "$status" = "reserved" ]
}
