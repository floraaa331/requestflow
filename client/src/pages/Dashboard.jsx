import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import StatsCards from '../components/StatsCards';
import TimelineChart from '../components/TimelineChart';
import LiveFeed from '../components/LiveFeed';
import Filters from '../components/Filters';
import RequestTable from '../components/RequestTable';
import AlertBanner from '../components/AlertBanner';
import CsvExport from '../components/CsvExport';
import SearchInput from '../components/SearchInput';

export default function Dashboard() {
  const [liveFeed, setLiveFeed] = useState([]);
  const [filters, setFilters] = useState({ method: '', statusClass: '', endpoint: '' });
  const [page, setPage] = useState(1);

  const tableQuery = new URLSearchParams({
    page: String(page),
    limit: '20',
    ...(filters.method && { method: filters.method }),
    ...(filters.statusClass && { statusClass: filters.statusClass }),
    ...(filters.endpoint && { endpoint: filters.endpoint }),
  }).toString();

  const { data: stats } = useApi('/api/stats', { pollInterval: 3000 });
  const { data: timeline } = useApi('/api/timeline', { pollInterval: 3000 });
  const { data: tableData, refetch: refetchTable } = useApi(`/api/requests?${tableQuery}`, { pollInterval: 5000 });

  useEffect(() => {
    refetchTable();
  }, [filters, page, refetchTable]);

  // Poll live feed every 2 seconds
  useEffect(() => {
    const fetchRecent = () => {
      fetch('/api/recent?limit=20')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setLiveFeed(data);
        })
        .catch(console.error);
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearch = (endpoint) => {
    setFilters((prev) => ({ ...prev, endpoint }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Error rate alert */}
      {stats && <AlertBanner errorRate={stats.errorRate} />}

      {/* Stats cards */}
      <StatsCards stats={stats} />

      {/* Chart + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TimelineChart timeline={timeline} />
        </div>
        <div>
          <LiveFeed requests={liveFeed} />
        </div>
      </div>

      {/* Filters + Search + Export + Table */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Filters filters={filters} onChange={handleFilterChange} />
          <div className="flex items-center gap-3">
            <SearchInput value={filters.endpoint} onChange={handleSearch} />
            <CsvExport data={tableData?.data} />
          </div>
        </div>
        <RequestTable
          data={tableData?.data}
          pagination={tableData?.pagination || { page: 1, totalPages: 1, total: 0 }}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
