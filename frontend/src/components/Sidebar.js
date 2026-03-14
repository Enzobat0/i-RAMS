import React, { useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

// Role display helpers
const ROLE_LABELS = {
  SENIOR_ENGINEER: 'Senior Engineer',
  DISTRICT_ENGINEER: 'District Engineer',
  SURVEY_AGENT: 'Survey Agent',
};

const ROLE_COLORS = {
  SENIOR_ENGINEER: 'bg-blue-100 text-[#155DFC]',
  DISTRICT_ENGINEER: 'bg-green-100 text-green-700',
  SURVEY_AGENT: 'bg-slate-100 text-slate-500',
};

// Nav items definition
// `requiredRole` — if set, only that role sees this item
const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    requiredRole: null, // visible to all
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: Settings,
    requiredRole: 'SENIOR_ENGINEER', // restricted
  },
];

const Sidebar = ({ currentPage, onNavigate, userRole, userName, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const roleColor = ROLE_COLORS[userRole] || 'bg-slate-100 text-slate-500';

  // Derive initials for the avatar from the user's name
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredRole || item.requiredRole === userRole
  );

  return (
    <aside
      className={`
        relative flex flex-col bg-white border-r border-slate-200 
        transition-all duration-300 ease-in-out shrink-0
        sticky top-0 h-screen overflow-y-auto
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* ── Logo / Brand ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-[#155DFC] flex items-center justify-center shrink-0">
          <MapPin size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-lg text-[#155DFC] tracking-tight whitespace-nowrap">
            i-RAMS
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {!collapsed && (
          <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
            Navigation
          </p>
        )}

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-150
                ${isActive
                  ? 'bg-blue-50 text-[#155DFC]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }
              `}
            >
              <Icon
                size={18}
                className={`shrink-0 ${isActive ? 'text-[#155DFC]' : 'text-slate-400'}`}
              />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
              {/* Active indicator dot when collapsed */}
              {collapsed && isActive && (
                <span className="absolute left-[3px] top-1/2 -translate-y-1/2 w-1 h-6 bg-[#155DFC] rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── User Profile + Logout ── */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-3">
        {/* User card */}
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#155DFC] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {userName || 'User'}
              </p>
              <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md ${roleColor}`}>
                {roleLabel}
              </span>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl
            text-xs font-semibold text-slate-400
            hover:bg-red-50 hover:text-red-500 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* ── Collapse Toggle Button ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="
          absolute -right-3 top-[72px]
          w-6 h-6 rounded-full bg-white border border-slate-200
          flex items-center justify-center shadow-sm
          hover:bg-blue-50 hover:border-blue-200 transition-all z-10
        "
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={12} className="text-slate-400" />
          : <ChevronLeft size={12} className="text-slate-400" />
        }
      </button>
    </aside>
  );
};

export default Sidebar;