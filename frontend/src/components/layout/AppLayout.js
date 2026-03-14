import React from 'react';
import Sidebar from '../Sidebar';

/**
 * AppLayout
 * ─────────
 * Root layout wrapper used by every authenticated page.
 * Renders the persistent Sidebar on the left and the active
 * page component (children) on the right.
 *
 * Props:
 *   currentPage  – string id of the active page ('dashboard' | 'configuration')
 *   onNavigate   – (pageId: string) => void  called by Sidebar nav items
 *   userRole     – string role from JWT ('SENIOR_ENGINEER' | ...)
 *   userName     – string full name from JWT
 *   onLogout     – () => void  called by Sidebar logout button
 *   children     – the page component to render in the main area
 */
const AppLayout = ({ currentPage, onNavigate, userRole, userName, onLogout, children }) => {
  return (
    <div className="flex min-h-screen bg-slate-100 font-['Inter']">

      {/* ── Left: Persistent Sidebar ── */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        userRole={userRole}
        userName={userName}
        onLogout={onLogout}
      />

      {/* ── Right: Page Content Area ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>

    </div>
  );
};

export default AppLayout;