/**
 * Color-coded HTTP method badge.
 * Each method gets a distinct color for quick visual scanning.
 */

import React from 'react';

const methodStyles = {
  GET: 'bg-blue-500/20 text-blue-400',
  POST: 'bg-emerald-500/20 text-emerald-400',
  PUT: 'bg-amber-500/20 text-amber-400',
  PATCH: 'bg-purple-500/20 text-purple-400',
  DELETE: 'bg-red-500/20 text-red-400',
};

export default function MethodBadge({ method }) {
  const style = methodStyles[method] || 'bg-gray-500/20 text-gray-400';

  return (
    <span className={`${style} px-2 py-0.5 rounded text-xs font-mono font-bold w-16 text-center`}>
      {method}
    </span>
  );
}
