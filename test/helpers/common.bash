#!/usr/bin/env bash

# Set up environment variables for testing
setup_environment() {
	export API_BASE_URL=${API_BASE_URL:-"http://localhost:3000"}
}

# Clean up test artifacts
teardown_environment() {
	# Clean up database
	curl -s -X POST "${API_BASE_URL}/test/cleanup" > /dev/null
	unset API_BASE_URL
}

# Function to make API requests
api_request() {
	local method=$1
	local endpoint=$2
	local data=$3
	local curl_opts=$4

	if [[ -n "$data" ]]; then
		curl -s -X "$method" "${API_BASE_URL}${endpoint}" \
			-H "Content-Type: application/json" \
			-d "$data" $curl_opts
	else
		curl -s -X "$method" "${API_BASE_URL}${endpoint}" \
			-H "Content-Type: application/json" $curl_opts
	fi
}

# Create a new event
create_event() {
	local name=$1
	local date=$2
	local total_tickets=$3

	# Add random suffix to event name
	local random_suffix=$(openssl rand -hex 4)
	local unique_name="${name}-${random_suffix}"

	local data=$(
		cat <<EOF
{
  "name": "$unique_name",
  "date": "$date",
  "totalTickets": $total_tickets
}
EOF
	)

	local response=$(api_request "POST" "/events" "$data")
	
	# Check for error response
	if [[ $(echo "$response" | jq -r 'if type=="object" and has("error") then .error else empty end') ]]; then
		echo "Error creating event: $(echo "$response" | jq -r '.error')" >&2
		return 1
	fi
	
	echo "$response"
}

# Get an event by ID
get_event() {
	local id=$1
	api_request "GET" "/events/$id"
}

# List events with pagination
list_events() {
	local page=${1:-1}
	local limit=${2:-10}
	api_request "GET" "/events?page=$page&limit=$limit"
}

# Extract value from JSON response
json_value() {
	local json=$1
	local path=$2
	echo "$json" | jq -r "$path"
}

# Wait for the API to be ready
wait_for_api() {
	local max_attempts=${1:-30}
	local attempt=0
	local status

	echo "Waiting for API to be ready..."
	while [[ $attempt -lt $max_attempts ]]; do
		status=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/health" || echo "error")

		if [[ "$status" == "200" ]]; then
			echo "API is ready!"
			return 0
		fi

		((attempt++))
		echo "Attempt $attempt/$max_attempts: API not ready yet (status: $status). Waiting..."
		sleep 1
	done

	echo "API failed to become ready after $max_attempts attempts"
	return 1
}

# Purchase tickets for an event
purchase_tickets() {
	local event_id=$1
	local quantity=$2
	local user_fingerprint=$3

	curl -s -X POST "${API_BASE_URL}/events/${event_id}/tickets" \
		-H "Content-Type: application/json" \
		-d "{\"quantity\": ${quantity}, \"userFingerprint\": \"${user_fingerprint}\"}"
}

# Confirm a ticket purchase
confirm_ticket() {
	local allocation_id=$1
	local user_fingerprint=${2:-"user-1"}

	curl -s -X POST "${API_BASE_URL}/events/tickets/${allocation_id}/payment" \
		-H "Content-Type: application/json" \
		-d "{\"userFingerprint\": \"${user_fingerprint}\"}"
}

# Cancel a ticket purchase
cancel_ticket() {
	local allocation_id=$1

	curl -s -X DELETE "${API_BASE_URL}/events/tickets/${allocation_id}/payment"
}

# Get a ticket allocation
get_ticket() {
	local allocation_id=$1

	curl -s -X GET "${API_BASE_URL}/events/tickets/${allocation_id}"
}

# Expire a ticket allocation (test only)
expire_ticket() {
	local allocation_id=$1

	curl -s -X POST "${API_BASE_URL}/test/tickets/${allocation_id}/expire"
}
