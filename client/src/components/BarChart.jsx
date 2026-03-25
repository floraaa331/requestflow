/**
 * Horizontal bar chart — used on the Analytics page for slowest endpoints
 * and method breakdown. Pure SVG, no dependencies.
 */

import React from 'react';

export default function BarChart({ data, labelKey, valueKey, title, unit = '', color = 'rgb(59, 130, 246)' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 h-48 flex items-center justify-center text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  const maxVal = Math.max(1, ...data.map((d) => d[valueKey]));

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = (item[valueKey] / maxVal) * 100;
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-300 font-mono truncate max-w-[60%]">{item[labelKey]}</span>
                <span className="text-gray-400">
                  {typeof item[valueKey] === 'number' && item[valueKey] % 1 !== 0
                    ? item[valueKey].toFixed(1)
                    : item[valueKey]}
                  {unit}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
