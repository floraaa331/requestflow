/**
 * Custom hook for Server-Sent Events (SSE) connection.
 *
 * Architecture decision: SSE over WebSockets because our data flow is
 * unidirectional (server → client). SSE auto-reconnects on disconnect,
 * works through HTTP proxies, and requires zero additional dependencies.
 *
 * The hook manages connection lifecycle and exposes a clean callback API.
 */

import { useEffect, useRef } from 'react';

export function useSSE(url, onMessage) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessageRef.current(parsed);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = () => {
      // EventSource auto-reconnects; we just log for visibility
      console.warn('SSE connection error, will auto-reconnect...');
    };

    return () => eventSource.close();
  }, [url]);
}
