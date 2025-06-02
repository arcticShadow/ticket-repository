import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useFingerprint } from '../../hooks/useFingerprint';

interface TicketAllocation {
  id: string;
  status: string;
  expiresAt: string;
}

export const PaymentFlow = () => {
  const { id: eventId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<TicketAllocation | null>(null);
  const navigate = useNavigate();
  const { api } = useApi();
  const { fingerprint } = useFingerprint();

  const allocateTicket = useCallback(async () => {
    if (allocation) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/events/${eventId}/tickets`, { 
        userFingerprint: fingerprint, 
        quantity: 1 
      });
      setAllocation(response[0]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to allocate ticket. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId, fingerprint, api, allocation]);

  const handlePayment = useCallback(async () => {
    if (!allocation) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/events/tickets/${allocation.id}/payment`, { 
        userFingerprint: fingerprint 
      });
      navigate('/');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to process payment. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [fingerprint, allocation, api, navigate]);

  const handleCancel = useCallback(async () => {
    if (!allocation) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/events/tickets/${allocation.id}/payment`);
      navigate('/');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to cancel payment. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [allocation, api, navigate]);

  return (
    <article>
      <header>
        <h2>Demo Payment</h2>
      </header>

      <p>This is a demo application. No actual payment will be processed.</p>

      {allocation && (
        <section>
          <h3>Ticket Allocation</h3>
          <dl>
            <dt>Status</dt>
            <dd>{allocation.status}</dd>
            <dt>Expires At</dt>
            <dd>
              <time dateTime={allocation.expiresAt}>
                {new Date(allocation.expiresAt).toLocaleString()}
              </time>
            </dd>
          </dl>
        </section>
      )}

      {error && (
        <aside>
          <p>{error}</p>
        </aside>
      )}

      <nav>
        {isLoading ? (
          <button disabled>Processing...</button>
        ) : allocation ? (
          <>
            <button onClick={handlePayment}>Confirm Purchase</button>&nbsp;
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={allocateTicket}>Request Allocation</button>
        )}
      </nav>
    </article>
  );
};
