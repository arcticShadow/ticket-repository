# Flicket Web App

A React-based web application for managing events and tickets.

## Features

- View list of available events
- See event details including date and ticket availability
- Real-time ticket statistics using Server-Sent Events (SSE)
- Responsive design using Sakura CSS dark theme
- Semantic HTML structure

## Development

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with:
   ```
   VITE_API_URL=http://localhost:8080
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building

To build the application for production:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
src/
  ├── components/
  │   └── events/
  │       ├── EventList.tsx     # Main event listing component
  │       └── EventDetail.tsx   # Event detail with real-time stats
  ├── App.tsx                   # Root component with routing
  ├── main.tsx                 # Application entry point
  └── index.css                # Global styles
```

## Real-time Statistics

The application uses Server-Sent Events (SSE) to provide real-time updates for event statistics. The SSE integration is implemented in the `EventDetail` component and provides:

- Real-time ticket availability updates
- Live statistics for remaining, allocated, and confirmed tickets
- Automatic reconnection handling
- Connection state management
- Error handling for connection issues

The SSE stream is available at `/events/:id/stream` and provides updates in the following format:

```typescript
interface EventStatistics {
  totalTickets: number;
  remainingTickets: number;
  allocatedTickets: number;
  confirmedTickets: number;
  lastEvent?: {
    type: string;
    actor: string;
    timestamp: string;
  };
}
```

## Technologies Used

- React 19
- TypeScript
- React Router v7
- Sakura CSS (dark theme)
- Vite
- Server-Sent Events (SSE)
