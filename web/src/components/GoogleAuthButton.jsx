import { useEffect, useRef } from 'react';

export default function GoogleAuthButton({ onCredential, onError, text = 'continue_with' }) {
  const containerRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response?.credential) {
          onError?.('Jeton Google manquant.');
          return;
        }
        onCredential(response.credential);
      },
    });

    containerRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: '100%',
      text,
    });
  }, [clientId, onCredential, onError, text]);

  if (!clientId) {
    return (
      <button
        type="button"
        onClick={() => onError?.('Google OAuth non configure.')}
        className="btn-secondary w-full h-12 rounded-xl"
      >
        Continuer avec Google
      </button>
    );
  }

  return <div ref={containerRef} className="w-full flex justify-center" />;
}
