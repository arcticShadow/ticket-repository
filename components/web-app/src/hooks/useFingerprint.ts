import { useState, useEffect } from 'react';

const generateFingerprint = async (): Promise<string> => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ];
  
  const fingerprint = components.join('|');
  return btoa(fingerprint);
};

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    const getFingerprint = async () => {
      const storedFingerprint = localStorage.getItem('userFingerprint');
      if (storedFingerprint) {
        setFingerprint(storedFingerprint);
        return;
      }

      const newFingerprint = await generateFingerprint();
      localStorage.setItem('userFingerprint', newFingerprint);
      setFingerprint(newFingerprint);
    };

    getFingerprint();
  }, []);

  return { fingerprint };
}; 