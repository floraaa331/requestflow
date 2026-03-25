/**
 * Paginated request table — the detailed view of all recorded requests.
 * Receives data and pagination metadata from the parent.
 */

import React from 'react';
import StatusBadge from './StatusBadge';
import MethodBadge from './MethodBadge';

export default function RequestTable({ data, pagination, onPageChange }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-gray-500 text-center">
        No requests match the current filters.
      </div>
    );
  }

  const { page, totalPages, total } = pagination;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Method</th>
              <th className="px-4 py-3 text-left">Endpoint</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Response Time</th>
              <th className="px-4 py-3 text-right">Payload</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((req) => (
              <tr
                key={req.id}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">#{req.id}</td>
                <td className="px-4 py-2.5">
                  <MethodBadge method={req.method} />
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-300">{req.endpoint}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge code={req.status_code} />
                </td>
                <td className="px-4 py-2.5 text-right text-gray-300">{req.response_time_ms}ms</td>
                <td className="px-4 py-2.5 text-right text-gray-400 text-xs">
                  {(req.payload_size_bytes / 1024).toFixed(1)} KB
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">{req.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
        <span className="text-xs text-gray-500">
          {total} total requests
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-400">
            {page} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
