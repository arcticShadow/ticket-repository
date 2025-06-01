import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const eventData = {
      name: formData.get('name'),
      date: formData.get('date'),
      totalTickets: Number(formData.get('totalTickets')),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
      }

      const { id } = await response.json();
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <h1>Create New Event</h1>

      {error && (
        <aside>
          <p>Error: {error}</p>
        </aside>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Event Details</legend>

          <div>
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="date">Event Date</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label htmlFor="totalTickets">Total Tickets</label>
            <input
              type="number"
              id="totalTickets"
              name="totalTickets"
              required
              min={1}
              max={1000}
            />
          </div>
        </fieldset>

        <nav>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
          <button type="button" onClick={() => navigate('/')}>
            Cancel
          </button>
        </nav>
      </form>
    </article>
  );
} 