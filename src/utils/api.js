// utils/api.js
// Central fetch wrapper for all backend calls.
//
// Features:
//   1. Automatically attaches Authorization: Bearer <token> when a token exists.
//   2. Any 401 response clears the stored token and redirects to /login.
//   3. All callers get back the parsed JSON body (or throw on non-OK responses).

const BASE_URL = 'http://localhost:5000';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

/**
 * apiFetch(path, options)
 *
 * Thin wrapper around window.fetch.
 * path    — e.g. '/tasks' or '/login'
 * options — standard fetch init object (method, body, headers, …)
 *
 * Returns: parsed JSON body
 * Throws:  { status, message } on non-2xx responses
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach the token if we have one
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Global 401 handler — clear token and bounce to login
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    // Return a rejected promise so callers don't try to use the response
    return Promise.reject({ status: 401, message: 'Session expired. Please log in again.' });
  }

  // Parse body — backend always sends JSON
  const data = await res.json();

  if (!res.ok) {
    // Throw so callers can catch and display the error message
    throw { status: res.status, message: data.message || 'Something went wrong' };
  }

  return data;
}
