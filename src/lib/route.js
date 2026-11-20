import { describeRoute, findPathLocal } from './graph';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Asks the FastAPI Dijkstra endpoint for the route; if the backend isn't
 * running, computes the same route in the browser over the same graph.
 * Returns { path, segments, steps, floors } or null when there's no route.
 */
export async function getRoute(fromKey, toKey) {
  let path = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`${API}/navigation/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_key: fromKey, to_key: toKey }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok') path = data.path;
    }
  } catch {
    // backend offline: fall through to the local graph
  }
  if (!path) path = findPathLocal(fromKey, toKey);
  if (!path) return null;
  return { path, ...describeRoute(path) };
}
