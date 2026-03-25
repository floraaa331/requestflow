import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash || '#/dashboard');
  useEffect(() => {
    const handler = () => setRoute(window.location.hash || '#/dashboard');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}

export default function App() {
  const route = useHashRoute();
  const isDashboard = route !== '#/analytics';

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header with navigation */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              RF
            </div>
            <h1 className="text-lg font-semibold text-gray-100">RequestFlow</h1>

            {/* Navigation tabs */}
            <nav className="hidden sm:flex items-center gap-1 ml-4 bg-gray-900 rounded-lg p-0.5">
              <a
                href="#/dashboard"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isDashboard
                    ? 'bg-gray-800 text-gray-100'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Dashboard
              </a>
              <a
                href="#/analytics"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  !isDashboard
                    ? 'bg-gray-800 text-gray-100'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Analytics
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isDashboard ? <Dashboard /> : <Analytics />}
      </main>
    </div>
  );
}
