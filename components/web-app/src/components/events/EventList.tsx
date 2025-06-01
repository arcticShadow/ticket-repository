import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  date: string;
  availableTickets: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/events?page=${currentPage}&limit=10`,
        );
        if (!response.ok) throw new Error('Failed to fetch events');
        const { data, meta } = await response.json();
        setEvents(data);
        setPaginationMeta(meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <main><p>Loading events...</p></main>;
  }

  if (error) {
    return (
      <main>
        <p>Error: {error}</p>
      </main>
    );
  }

  if (events.length === 0) {
    return (
      <main>
        <h1>Upcoming Events</h1>
        <section>
          <article>
            <h2>No Events Available</h2>
            <p>There are currently no events scheduled. Please check back later.</p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main>
      <h1>Upcoming Events</h1>
      <section>
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Available Tickets</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <Link to={`/events/${event.id}`}>{event.name}</Link>
                </td>
                <td>
                  <time dateTime={event.date}>
                    {new Date(event.date).toLocaleDateString()}
                  </time>
                </td>
                <td>{event.availableTickets}</td>
                <td>
                  <Link to={`/events/${event.id}`}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>
                <nav>
                  
                      <a
                        onClick={() => handlePageChange(currentPage - 1)}
                        {...(currentPage === 1 ? {disabled: true} : {})}
                      >
                        Previous
                      </a>
                      &nbsp;
                      {currentPage} of {paginationMeta.pages}
                      &nbsp;
                      <a href="#"
                        onClick={() => handlePageChange(currentPage + 1)}
                        {...(currentPage === paginationMeta.pages ? {disabled: true} : {})}
                      >
                        Next
                      </a>
                </nav>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    </main>
  );
} 