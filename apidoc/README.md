# Flicket API Documentation

This directory contains API documentation and examples using [Bruno](https://www.usebruno.com/), an open-source API client.

## What is Bruno?

Bruno is a modern API client that makes it easy to design, test, and document APIs. It's an alternative to tools like Postman or Insomnia, with a focus on simplicity and git-friendliness.

## Installation

To use these API collections, you need to install Bruno:

- **macOS**: `brew install usebruno/tap/bruno`
- **Windows/Linux**: Download from [Bruno releases](https://github.com/usebruno/bruno/releases)

## Collection Structure

- **collection.bru** - Main configuration file with variables like the base URL
- **events/** - API requests related to event management
  - **create_event.bru** - Create a new event
  - **list_events.bru** - List events with pagination
  - **get_event.bru** - Get a specific event by ID

## Using the Collection

1. Open Bruno
2. Click "Open Collection"
3. Navigate to this `apidoc` directory
4. Select the folder and click "Open"

The collection will be loaded with all the requests. Each request includes:
- Documentation with request/response details
- Example request bodies
- Tests that validate responses

## Environment Variables

The collection uses the following variables:

- `baseUrl` - Base URL for the API (default: http://localhost:3000)
- `eventId` - Example event ID for testing (update this after creating an event)

You can modify these variables in Bruno to match your environment.

## Running Tests

Each request includes tests that verify the response. To run the tests:

1. Send the request
2. Check the "Tests" tab in the response panel

## Adding New Requests

To add a new request:

1. Create a new `.bru` file in the appropriate directory
2. Follow the Bruno format with meta, request details, and documentation
3. Add tests to validate the response

For more information on Bruno's syntax, see the [Bruno documentation](https://docs.usebruno.com/). 