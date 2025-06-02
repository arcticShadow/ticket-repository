const API_URL = import.meta.env.VITE_API_URL;

interface ApiData {
  userFingerprint: string;
  [key: string]: unknown;
}

export const useApi = () => {
  const api = {
    post: async (endpoint: string, data: ApiData) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      return response.json();
    },
    delete: async (endpoint: string) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      return response.json();
    }
  };

  return { api };
}; 