/**
 * Animated real-time line chart — shows request volume over the last 60 seconds.
 *
 * Architecture decision: Pure inline SVG instead of a charting library.
 * SVG <polyline> with CSS transitions gives us smooth animation between data
 * updates for free. The gradient fill uses an SVG <linearGradient> definition.
 * Total added bundle size: 0 bytes.
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';

const CHART_WIDTH = 700;
const CHART_HEIGHT = 140;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 20;
const DRAWABLE_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

export default function TimelineChart({ timeline }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Build a full 60-second window, filling gaps with zero
  const chartData = useMemo(() => {
    if (!timeline) return [];

    const now = new Date();
    const buckets = [];

    for (let i = 59; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 1000);
      const key = d.toISOString().replace('T', ' ').substring(0, 19);
      buckets.push({
        second: key,
        count: 0,
        label: d.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      });
    }

    const lookup = {};
    for (const row of timeline) {
      lookup[row.second] = row.count;
    }

    for (const bucket of buckets) {
      if (lookup[bucket.second]) {
        bucket.count = lookup[bucket.second];
      }
    }

    return buckets;
  }, [timeline]);

  const maxCount = Math.max(1, ...chartData.map((d) => d.count));

  // Convert data points to SVG coordinates
  const points = useMemo(() => {
    if (chartData.length === 0) return [];
    const stepX = CHART_WIDTH / (chartData.length - 1);
    return chartData.map((d, i) => ({
      x: i * stepX,
      y: PADDING_TOP + DRAWABLE_HEIGHT - (d.count / maxCount) * DRAWABLE_HEIGHT,
      count: d.count,
      label: d.label,
    }));
  }, [chartData, maxCount]);

  // Build the SVG polyline path and the filled area path
  const linePath = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `0,${PADDING_TOP + DRAWABLE_HEIGHT} ${linePath} ${CHART_WIDTH},${PADDING_TOP + DRAWABLE_HEIGHT}`
    : '';

  // Handle mouse movement for tooltip
  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const stepX = CHART_WIDTH / (points.length - 1);
    const idx = Math.round(relX / stepX);
    const clamped = Math.max(0, Math.min(points.length - 1, idx));
    setHoveredIndex(clamped);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 h-52 flex items-center justify-center text-gray-500">
        Waiting for data...
      </div>
    );
  }

  // Y-axis grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
    y: PADDING_TOP + DRAWABLE_HEIGHT - frac * DRAWABLE_HEIGHT,
    label: Math.round(frac * maxCount),
  }));

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        Request Volume (last 60 seconds)
      </h3>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-40"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Gradient fill under the line */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {gridLines.map((g, i) => (
            <line
              key={i}
              x1="0" y1={g.y} x2={CHART_WIDTH} y2={g.y}
              stroke="rgb(55, 65, 81)" strokeWidth="0.5" strokeDasharray="4 4"
            />
          ))}

          {/* Filled area under the curve */}
          {areaPath && (
            <polygon
              points={areaPath}
              fill="url(#areaGrad)"
              className="transition-all duration-500"
            />
          )}

          {/* The line itself */}
          {linePath && (
            <polyline
              points={linePath}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}

          {/* Data point dots */}
          {points.map((p, i) => (
            p.count > 0 && (
              <circle
                key={i}
                cx={p.x} cy={p.y} r={hoveredIndex === i ? 4 : 2}
                fill="rgb(59, 130, 246)"
                className="transition-all duration-200"
              />
            )
          ))}

          {/* Hover vertical line */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <line
              x1={points[hoveredIndex].x} y1={PADDING_TOP}
              x2={points[hoveredIndex].x} y2={PADDING_TOP + DRAWABLE_HEIGHT}
              stroke="rgb(156, 163, 175)" strokeWidth="0.5" strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-gray-800 text-xs text-gray-200 px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none z-10 whitespace-nowrap border border-gray-700"
            style={{
              left: Math.min(mousePos.x + 12, (svgRef.current?.clientWidth || 600) - 100),
              top: Math.max(mousePos.y - 40, 0),
            }}
          >
            <span className="text-blue-400 font-bold">{chartData[hoveredIndex].count}</span> req &middot; {chartData[hoveredIndex].label}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-600">
        <span>-60s</span>
        <span>-30s</span>
        <span>now</span>
      </div>
    </div>
  );
}
