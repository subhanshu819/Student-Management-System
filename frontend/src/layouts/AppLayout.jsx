import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

/**
 * Main application layout: fixed sidebar + sticky topbar + scrollable main content.
 * Passes breadcrumbs down via context or route meta (simplified: children provide their own topbar props via outlet context).
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8f9ff' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area offset by sidebar width */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <Outlet context={{ onMenuToggle: () => setSidebarOpen(o => !o) }} />
      </div>
    </div>
  );
}
