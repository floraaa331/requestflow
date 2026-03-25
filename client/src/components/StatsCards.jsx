/**
 * Dashboard stat cards — four KPIs at a glance.
 * Each card shows a label, value, and contextual color.
 */

import React from 'react';

const cards = [
  {
    key: 'totalRequests',
    label: 'Total Requests',
    format: (v) => v.toLocaleString(),
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    key: 'avgResponseTime',
    label: 'Avg Response Time',
    format: (v) => `${v} ms`,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    key: 'errorRate',
    label: 'Error Rate',
    format: (v) => `${v}%`,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    key: 'requestsPerSecond',
    label: 'Requests/sec',
    format: (v) => v.toFixed(2),
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

export default function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, format, color, bg, border }) => (
        <div
          key={key}
          className={`${bg} ${border} border rounded-xl p-5 transition-all duration-300`}
        >
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {format(stats[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
