import { useEffect, useState } from 'react';
import { http } from './api';

export function useStudio() {
  const [studio, setStudio] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancel = false;
    http
      .get('/studio')
      .then((response) => {
        if (!cancel) setStudio(response.data);
      })
      .catch((err) => {
        if (cancel) return;
        setError(err.response?.status === 401 ? 'Sign in to use this page.' : 'Could not load your studio.');
      });
    return () => {
      cancel = true;
    };
  }, []);

  async function save(next) {
    setBusy(true);
    setNote('');
    setError('');
    setStudio(next);
    try {
      const response = await http.put('/studio', next);
      setStudio(response.data);
      setNote('Saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  return { studio, save, note, error, busy };
}

export function Banner({ note, error }) {
  return (
    <>
      {note ? <p className="banner">{note}</p> : null}
      {error ? <p className="banner bad">{error}</p> : null}
    </>
  );
}

export function nid() {
  return Math.random().toString(36).slice(2, 10);
}
