#!/usr/bin/env bats

# Load common helper functions
load "../helpers/common.bash"
load "../helpers/fixtures.bash"

setup() {
	setup_environment
}

teardown() {
	teardown_environment
}

# Helper function to make parallel GET requests
parallel_get_requests() {
	local url=$1
	local count=$2
	local output_file="$BATS_TEST_TMPDIR/load_test_output.txt"

	# Clear output file
	>"$output_file"

	# Run multiple requests in parallel
	for i in $(seq 1 $count); do
		{
			start_time=$(date +%s.%N)
			status_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}${url}")
			end_time=$(date +%s.%N)
			duration=$(echo "$end_time - $start_time" | bc)

			echo "$i,$status_code,$duration" >>"$output_file"
		} &

		# Add a small delay to prevent overwhelming the system
		sleep 0.01
	done

	# Wait for all background processes to finish
	wait

	# Return content of output file
	cat "$output_file"
}

@test "API can handle multiple concurrent requests" {
	# Skip if not running a load test
	if [ "${BATS_LOAD_TEST:-0}" != "1" ]; then
		skip "Skipping load test (set BATS_LOAD_TEST=1 to run)"
	fi

	# Create test events
	create_events_from_fixture "events.json"

	# Make 50 concurrent requests to list events
	results=$(parallel_get_requests "/events" 50)

	# Count successful responses
	successful=$(echo "$results" | grep -c ",200,")

	# All requests should be successful
	[ "$successful" -eq 50 ]

	# Calculate average response time
	total_time=$(echo "$results" | cut -d ',' -f 3 | paste -sd+ | bc)
	count=$(echo "$results" | wc -l)
	avg_time=$(echo "scale=3; $total_time / $count" | bc)

	# Log performance statistics
	echo "Average response time: ${avg_time}s for $count requests"

	# Average response time should be less than 1 second
	comparison=$(echo "$avg_time < 1.0" | bc)
	[ "$comparison" -eq 1 ]
}
