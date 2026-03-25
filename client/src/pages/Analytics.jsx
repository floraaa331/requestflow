import React from 'react';
import { useApi } from '../hooks/useApi';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';

export default function Analytics() {
  const { data, loading } = useApi('/api/analytics', { pollInterval: 5000 });

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-400 mb-1">Unique Endpoints</p>
          <p className="text-2xl font-bold text-blue-400">
            {data.slowestEndpoints?.length ?? 0}
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-400 mb-1">Error Status Codes</p>
          <p className="text-2xl font-bold text-red-400">
            {data.errorDistribution?.length ?? 0}
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-400 mb-1">HTTP Methods Used</p>
          <p className="text-2xl font-bold text-emerald-400">
            {data.methodBreakdown?.length ?? 0}
          </p>
        </div>
      </div>

      {/* Charts row 1: Slowest endpoints (full width) */}
      <BarChart
        data={data.slowestEndpoints}
        labelKey="endpoint"
        valueKey="avg_time"
        title="Top 5 Slowest Endpoints (avg response time)"
        unit=" ms"
        color="rgb(249, 115, 22)"
      />

      {/* Charts row 2: Error distribution + Method breakdown side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChart
          data={data.errorDistribution}
          labelKey="status_code"
          valueKey="count"
          title="Error Distribution by Status Code"
        />
        <BarChart
          data={data.methodBreakdown}
          labelKey="method"
          valueKey="count"
          title="Requests by HTTP Method"
          color="rgb(59, 130, 246)"
        />
      </div>
    </div>
  );
}
