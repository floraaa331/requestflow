/**
 * SVG donut/pie chart — used for error distribution by status code.
 * Pure math + SVG, no charting library. Uses stroke-dasharray trick
 * to create segments on a circle.
 */

import React, { useMemo } from 'react';

const COLORS = [
  'rgb(239, 68, 68)',   // red-500
  'rgb(249, 115, 22)',  // orange-500
  'rgb(234, 179, 8)',   // yellow-500
  'rgb(168, 85, 247)',  // purple-500
  'rgb(236, 72, 153)',  // pink-500
  'rgb(59, 130, 246)',  // blue-500
  'rgb(20, 184, 166)',  // teal-500
];

export default function PieChart({ data, labelKey, valueKey, title }) {
  const total = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, d) => sum + d[valueKey], 0);
  }, [data, valueKey]);

  // Calculate segment positions using cumulative angles
  const segments = useMemo(() => {
    if (!data || total === 0) return [];
    const RADIUS = 60;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    let offset = 0;

    return data.map((item, i) => {
      const pct = item[valueKey] / total;
      const dashLength = pct * CIRCUMFERENCE;
      const seg = {
        dasharray: `${dashLength} ${CIRCUMFERENCE - dashLength}`,
        offset: -offset,
        color: COLORS[i % COLORS.length],
        label: String(item[labelKey]),
        value: item[valueKey],
        pct: Math.round(pct * 100),
      };
      offset += dashLength;
      return seg;
    });
  }, [data, total, labelKey, valueKey]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 h-48 flex items-center justify-center text-gray-500 text-sm">
        No errors recorded
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        {/* Donut chart */}
        <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="70" cy="70" r="60"
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.offset}
              transform="rotate(-90 70 70)"
              className="transition-all duration-500"
            />
          ))}
          <text x="70" y="66" textAnchor="middle" className="fill-gray-300 text-lg font-bold" fontSize="18">
            {total}
          </text>
          <text x="70" y="82" textAnchor="middle" className="fill-gray-500" fontSize="10">
            errors
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-36">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-gray-400 font-mono">{seg.label}</span>
              <span className="text-gray-500">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
