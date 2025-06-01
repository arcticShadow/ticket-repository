# 001. Backend Technology Stack Selection

**Classifications:** backend-framework, language

## Status

Explicitly stated

## Context

The application requires a backend API to handle event management and ticket purchasing with concurrency requirements. The specification mandates Node.js with TypeScript and suggests NestJS as the preferred framework.

## Decision

Use Node.js with TypeScript as the backend runtime and language. NestJS is recommended, we will use NestJS, but will not use GraphQL as that is an added layer of complexity at this stage. 

## Consequences

### Constraints 
- Must use Node.js runtime environment
- Must implement TypeScript for type safety
- API design should follow RESTful principles
- Framework choice (NestJS vs alternatives) affects project structure and patterns
- use of NextJS will mandate some backend processes and design choices. (such as modular code)

### Dependencies
- Impacts database driver selection and ORM choices
- Affects API design patterns and middleware architecture
- Influences testing framework and development tooling decisions

### Risk Level
Medium - Core technology choice that affects entire backend architecture

### Reversibility
Difficult - Changing runtime or core language would require complete backend rewrite

### Other Considered Options
- **Express.js with TypeScript** - Lighter weight, more manual configuration
- **Fastify with TypeScript** - Higher performance, smaller ecosystem
- **GraphQL instead of REST** - Explicitly discouraged in specification 