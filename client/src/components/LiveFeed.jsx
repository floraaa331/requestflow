/**
 * Live feed — shows the most recent requests as they arrive in real-time.
 * New items appear at the top with a brief highlight animation.
 */

import React from 'react';
import StatusBadge from './StatusBadge';
import MethodBadge from './MethodBadge';

export default function LiveFeed({ requests }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-gray-500 text-center">
        Waiting for requests...
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
        <h3 className="text-sm font-medium text-gray-400">Live Feed</h3>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto live-feed">
        {requests.map((req, idx) => (
          <div
            key={req.id ?? idx}
            className="flex items-center gap-3 text-sm bg-gray-800/50 rounded-lg px-3 py-2 animate-fade-in"
          >
            <MethodBadge method={req.method} />
            <span className="text-gray-300 flex-1 truncate font-mono text-xs">
              {req.endpoint}
            </span>
            <StatusBadge code={req.status_code} />
            <span className="text-gray-500 text-xs w-16 text-right">
              {req.response_time_ms}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
