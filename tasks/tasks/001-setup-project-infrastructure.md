# 001 Setup Project Infrastructure

## Dependencies
- ADR-001: Backend Technology Stack
- ADR-002: Frontend Technology Stack
- ADR-003: Database Technology Selection

## Description
Set up the initial project structure with both backend (NestJS) and frontend (React) applications, along with PostgreSQL database configuration. This task establishes the foundation for all further development.

## Technical Requirements
- Initialize a NestJS backend application with TypeScript
- Set up a React frontend application with TypeScript using Vite
- Configure PostgreSQL database connection
- Implement basic application structure following ADR decisions
- Set up linting and formatting configuration
- Configure environment variables for local development

## Specific test cases required
- Backend server starts without errors
- Frontend development server starts without errors
- Database connection can be established
- Basic health check endpoint returns 200 OK

## Acceptance Criteria
- [ ] NestJS backend is initialized with TypeScript and proper folder structure
- [ ] React frontend is initialized with TypeScript, Vite, and Sakura CSS (dark theme)
- [ ] PostgreSQL database connection is configured and working
- [ ] Backend and frontend applications can be started with npm scripts
- [ ] Basic README with setup instructions is created
- [ ] Environment variables are documented
- [ ] Tests passing

## Implementation Notes
- Use NestJS CLI to generate the backend application structure
- Use Vite for React frontend setup (create-vite-app)
- For database connection, use TypeORM with NestJS
- Include Sakura CSS with dark theme for basic styling
- Use dotenv for environment variable management
- Setup scripts should include database initialization
- database migrations should be handled by typeorm

## Documentation Requirements:
- [ ] README.md with setup instructions
- [ ] .env.example file with required environment variables 