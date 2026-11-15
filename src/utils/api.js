// utils/api.js
// Central fetch wrapper for all backend calls.
//
// Features:
//   1. Base URL comes from VITE_API_URL (build-time env), so the same code works
//      locally, inside Docker (nginx proxies /api) and on Vercel.
//   2. Automatically attaches Authorization: Bearer <token> when a token exists.
//   3. A 401 on a request that SENT a token means the session is invalid:
//      the token is cleared and the user is sent to /login.
//      A 401 without a token (e.g. wrong password on /login) is just an error
//      and its message is shown to the user.
//   4. Network failures and non-JSON responses become readable errors.

// `??` (not `||`) so that VITE_API_URL="" means "same origin" (used in Docker).
export const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

const TOKEN_KEY = 'token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * apiFetch(path, options)
 *
 * path    — e.g. '/api/tasks'
 * options — standard fetch init object (method, body, headers, signal, …)
 *
 * Returns: parsed JSON body (or null for empty responses)
 * Throws:  ApiError { status, message } on failure
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Cannot reach the server. Is the backend running?');
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 200) };
    }
  }

  if (res.status === 401 && token) {
    clearToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || `Request failed (${res.status})`, data?.errors);
  }

  return data;
}
