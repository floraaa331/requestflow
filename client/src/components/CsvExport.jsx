/**
 * CSV export button — downloads the currently visible (filtered) table data.
 * Generates CSV client-side from the data already fetched, no extra API call.
 */

import React from 'react';

function escapeCsvField(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function CsvExport({ data }) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const headers = ['ID', 'Method', 'Endpoint', 'Status Code', 'Response Time (ms)', 'Payload (bytes)', 'Timestamp'];
    const rows = data.map((r) => [
      r.id,
      r.method,
      r.endpoint,
      r.status_code,
      r.response_time_ms,
      r.payload_size_bytes,
      r.created_at,
    ].map(escapeCsvField).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `requestflow-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-700"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M7 2v7M4 6l3 3 3-3M2 10v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V10" />
      </svg>
      Export CSV
    </button>
  );
}
