import axios from 'axios';

export const csrfToken = () =>
  window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

export function apiHeaders(): Record<string, string | null | undefined> {
  return {
    'X-CSRF-Token': csrfToken(),
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function post(url: string, data: any = {}) {
  return axios.post(url, data, { headers: apiHeaders() });
}
