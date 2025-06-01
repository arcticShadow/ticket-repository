import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  date: string;
  totalTickets: number;
  allocatedTickets: number;
  availableTickets: number;
  createdAt: string;
  updatedAt: string;
}

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

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sseError, setSseError] = useState<string | null>(null);

  const handleBuyTicket = useCallback(() => {
    if (id) {
      navigate(`/events/${id}/purchase`);
    }
  }, [id, navigate]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`);
        if (!response.ok) throw new Error('Failed to fetch event');
        const responseData = await response.json();
        const eventData = responseData.data || responseData;
        setEvent(eventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/events/${id}/stream`);

    eventSource.onmessage = (event) => {
      const stats = JSON.parse(event.data);
      setStatistics(stats);
    };

    eventSource.onerror = () => {
      setSseError('Lost connection to real-time updates');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  if (loading) {
    return <main><p>Loading event details...</p></main>;
  }

  if (error) {
    return (
      <main>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/')}>Return to Events</button>
      </main>
    );
  }

  if (!event) {
    return (
      <main>
        <p>Event not found</p>
        <button onClick={() => navigate('/')}>Return to Events</button>
      </main>
    );
  }

  return (
    <main>
      <article>
        <h1>{event.name}</h1>
        
        <section>
          <h2>Event Information</h2>
          <dl>
            <dt>Date and Time</dt>
            <dd>
              <time dateTime={event.date}>
                {new Date(event.date).toLocaleString()}
              </time>
            </dd>

            <dt>Created</dt>
            <dd>
              <time dateTime={event.createdAt}>
                {new Date(event.createdAt).toLocaleString()}
              </time>
            </dd>

            <dt>Last Updated</dt>
            <dd>
              <time dateTime={event.updatedAt}>
                {new Date(event.updatedAt).toLocaleString()}
              </time>
            </dd>
          </dl>
        </section>

        <section>
          <h2>Ticket Information</h2>
          <dl>
            <dt>Total Tickets</dt>
            <dd>{event.totalTickets}</dd>

            <dt>Allocated Tickets</dt>
            <dd>{event.allocatedTickets}</dd>

            <dt>Available Tickets</dt>
            <dd>{event.availableTickets}</dd>
          </dl>
        </section>

        {statistics && (
          <section>
            <h2>Live Ticket Statistics</h2>
            <dl>
              <dt>Total Tickets</dt>
              <dd>{statistics.totalTickets}</dd>

              <dt>Remaining Tickets</dt>
              <dd>{statistics.remainingTickets}</dd>

              <dt>Allocated Tickets</dt>
              <dd>{statistics.allocatedTickets}</dd>

              <dt>Confirmed Tickets</dt>
              <dd>{statistics.confirmedTickets}</dd>
            </dl>

            {statistics.lastEvent && (
              <aside>
                <h3>Last Update</h3>
                <dl>
                  <dt>Time</dt>
                  <dd>
                    <time dateTime={statistics.lastEvent.timestamp}>
                      {new Date(statistics.lastEvent.timestamp).toLocaleString()}
                    </time>
                  </dd>
                  <dt>Action</dt>
                  <dd>{statistics.lastEvent.type}</dd>
                  <dt>Actor</dt>
                  <dd>{statistics.lastEvent.actor}</dd>
                </dl>
              </aside>
            )}
          </section>
        )}

        {sseError && (
          <aside>
            <p>Warning: {sseError}</p>
          </aside>
        )}

        <nav>
          {event.availableTickets <= 0 ? (
            <button disabled>Sold Out</button>
          ) : (
            <button onClick={handleBuyTicket}>Buy Ticket</button>
          )}
          <button onClick={() => navigate('/')}>Back to Events</button>
        </nav>
      </article>
    </main>
  );
}
