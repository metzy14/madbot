import axios from 'axios';

// Dev uses the CRA proxy (package.json "proxy") so the session cookie is same-site.
// Production calls the deployed API unless REACT_APP_API_URL overrides it.
export const API =
  process.env.NODE_ENV === 'development'
    ? ''
    : process.env.REACT_APP_API_URL || 'https://madbot-backend.onrender.com';

export const http = axios.create({
  baseURL: API,
  withCredentials: true,
});
