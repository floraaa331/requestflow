/**
 * Dismissible alert banner — appears when error rate exceeds a threshold.
 * Uses a subtle slide-down animation and persists dismissal until error rate
 * drops below threshold and rises again (re-triggers the alert).
 */

import React, { useState, useEffect, useRef } from 'react';

const ERROR_THRESHOLD = 30; // percent

export default function AlertBanner({ errorRate }) {
  const [dismissed, setDismissed] = useState(false);
  const prevBelowRef = useRef(true);

  const isAbove = errorRate > ERROR_THRESHOLD;

  // Re-show alert if error rate dropped below threshold then rose again
  useEffect(() => {
    if (!isAbove) {
      prevBelowRef.current = true;
    } else if (prevBelowRef.current && isAbove) {
      prevBelowRef.current = false;
      setDismissed(false);
    }
  }, [isAbove]);

  if (!isAbove || dismissed) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between animate-slide-down">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse-dot" />
        <span className="text-sm text-red-300">
          <span className="font-semibold">High Error Rate:</span>{' '}
          {errorRate}% of requests are failing (threshold: {ERROR_THRESHOLD}%)
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-400 hover:text-red-300 transition-colors p-1"
        aria-label="Dismiss alert"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}
