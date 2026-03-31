import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '../Sidebar';

const AppLayout = ({ currentPage, onNavigate, userRole, userName, onLogout, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slide-in overlay when toggled */}
      <div className={`
        fixed inset-y-0 left-0 z-40 lg:relative lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          userRole={userRole}
          userName={userName}
          onLogout={onLogout}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#025864] sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-1"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-bold text-white text-sm">i-RAMS</span>
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;