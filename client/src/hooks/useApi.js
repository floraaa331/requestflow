/**
 * Lightweight data-fetching hook with polling support.
 *
 * Architecture decision: No external data-fetching library (react-query, SWR).
 * Our needs are simple — periodic polling for stats/timeline. A 40-line hook
 * handles this without adding bundle weight or API surface area.
 */

import { useState, useEffect, useCallback } from 'react';

export function useApi(url, { pollInterval = null, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();

    if (pollInterval && enabled) {
      const interval = setInterval(fetchData, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollInterval, enabled]);

  return { data, error, loading, refetch: fetchData };
}
