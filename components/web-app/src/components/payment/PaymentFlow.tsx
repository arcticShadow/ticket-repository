import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useFingerprint } from '../../hooks/useFingerprint';

export const PaymentFlow = () => {
  const { id: eventId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { api } = useApi();
  const { fingerprint } = useFingerprint();

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/events/${eventId}/tickets`, { userFingerprint: fingerprint, quantity: 1 });
      navigate('/');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to process payment. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/events/${eventId}/cancel`, { userFingerprint: fingerprint });
      navigate('/');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to cancel payment. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article>
      <header>
        <h2>Demo Payment</h2>
      </header>

      <p>This is a demo application. No actual payment will be processed.</p>

      {error && (
        <aside>
          <p>{error}</p>
        </aside>
      )}

      <nav>
        {isLoading ? (
          <button disabled>Processing...</button>
        ) : (
          <>
            <button onClick={handlePayment}>Pay Now</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        )}
      </nav>
    </article>
  );
};
