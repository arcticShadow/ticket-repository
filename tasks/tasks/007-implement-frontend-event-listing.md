# 007 Implement Frontend Event Listing

## Dependencies

- 001: Setup Project Infrastructure
- 003: Implement Event Management API
- ADR-002: Frontend Technology Stack
- ADR-009: UI Component Library Approach

## Description

Implement the main page of the application where users can view a list of available events. This page will serve as the entry point to the application and allow users to navigate to individual event pages.

## Technical Requirements

- Create SIMPLE React components for the event listing page
    - BIG emphasis on using semantic HTML properly
- Implement API integration to fetch events from the backend
- Apply Sakura CSS with dark theme for styling
- DO NOT implement any custom styling. DO NOT implement any css. Use only semantic html elements and rely on Sakura to style these appropriately. 
- Display relevant event information in an easy-to-read format

## Specific test cases required

n/a - Chosen not to perform frontend tests in favour of time constraints

## Acceptance Criteria

- [x] Main page displays a list of all available events
- [x] Each event shows name, date, and ticket availability
- [x] Users can click on an event to navigate to its detail page
- [x] Page has proper loading, error, and empty states
- [x] Sakura CSS dark theme is applied correctly

## Implementation Notes

- Use React with TypeScript as specified in ADR-002
- Implement with functional components and hooks
- Use native fetch for API calls
- API URL to be passed to the BUILD as an env var
- Apply Sakura CSS with dark theme as requested
- Add simple filtering (frontend only) or sorting capabilities if time permits
- Use React Router V7, in declarative mode for navigation to event detail pages
- Implement basic error handling for API failures. Suggest using a `<footer>` element below the `<main>` content

## Documentation Requirements:

- [x] Update README.md with frontend information
- [x] Document component structure and organization
