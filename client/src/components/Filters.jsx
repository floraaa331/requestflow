/**
 * Filter bar — allows filtering requests by HTTP method and status code class.
 * Selections are lifted to the parent via onChange callback.
 */

import React from 'react';

const METHODS = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUS_CLASSES = ['ALL', '2xx', '3xx', '4xx', '5xx'];

export default function Filters({ filters, onChange }) {
  const handleMethod = (method) => {
    onChange({ ...filters, method: method === 'ALL' ? '' : method });
  };

  const handleStatus = (statusClass) => {
    onChange({ ...filters, statusClass: statusClass === 'ALL' ? '' : statusClass });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Method filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Method:</span>
        <div className="flex gap-1">
          {METHODS.map((m) => {
            const active = (m === 'ALL' && !filters.method) || filters.method === m;
            return (
              <button
                key={m}
                onClick={() => handleMethod(m)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  active
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status class filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Status:</span>
        <div className="flex gap-1">
          {STATUS_CLASSES.map((s) => {
            const active = (s === 'ALL' && !filters.statusClass) || filters.statusClass === s;
            return (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  active
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
