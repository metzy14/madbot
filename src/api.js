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

export const http = axios.create({
  baseURL: API,
  withCredentials: true,
});

