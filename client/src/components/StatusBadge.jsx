/**
 * Color-coded status code badge.
 * Green for 2xx, yellow for 3xx, orange for 4xx, red for 5xx.
 */

import React from 'react';

const statusStyles = {
  2: 'bg-emerald-500/20 text-emerald-400',
  3: 'bg-yellow-500/20 text-yellow-400',
  4: 'bg-orange-500/20 text-orange-400',
  5: 'bg-red-500/20 text-red-400',
};

export default function StatusBadge({ code }) {
  const classKey = Math.floor(code / 100);
  const style = statusStyles[classKey] || 'bg-gray-500/20 text-gray-400';

  return (
    <span className={`${style} px-2 py-0.5 rounded text-xs font-mono font-medium`}>
      {code}
    </span>
  );
}
