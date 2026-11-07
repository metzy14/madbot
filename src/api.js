import axios from 'axios';

// API calls in dev go through the CRA proxy so the session cookie stays on localhost.
// Login and logout are full-page navigations. CRA does not proxy those, so they
// must hit the API port directly.
export const API =
  process.env.NODE_ENV === 'development'
    ? ''
    : process.env.REACT_APP_API_URL || 'https://madbot-backend.onrender.com';

export const AUTH_ORIGIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:10000'
    : API;

const SESSION_KEY = 'madbot.session';

if (typeof window !== 'undefined') {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const session = hash.get('session');
  if (session) {
    window.sessionStorage.setItem(SESSION_KEY, session);
    hash.delete('session');
    const rest = hash.toString();
    window.history.replaceState(null, '', window.location.pathname + window.location.search + (rest ? `#${rest}` : ''));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY);
}

export const http = axios.create({
  baseURL: API,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = window.sessionStorage.getItem(SESSION_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
