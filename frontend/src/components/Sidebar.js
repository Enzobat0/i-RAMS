import React, { useState } from 'react';
import {
  LayoutDashboard,
  Table,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Route,
} from 'lucide-react';

const ROLE_LABELS = {
  SENIOR_ENGINEER: 'Senior Engineer',
  DISTRICT_ENGINEER: 'District Engineer',
  SURVEY_AGENT: 'Survey Agent',
};

const ROLE_COLORS = {
  SENIOR_ENGINEER: 'bg-[#00D47E]/15 text-[#00D47E]',
  DISTRICT_ENGINEER: 'bg-[#00D47E]/15 text-[#00D47E]',
  SURVEY_AGENT: 'bg-white/10 text-white/60',
};

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    requiredRole: null,
  },
  {
    id: 'inventory',
    label: 'Road Inventory',
    icon: Table,
    requiredRole: null,
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: Settings,
    requiredRole: 'SENIOR_ENGINEER',
  },
];

const Sidebar = ({ currentPage, onNavigate, userRole, userName, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const roleColor = ROLE_COLORS[userRole] || 'bg-slate-100 text-slate-500';

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredRole || item.requiredRole === userRole
  );

  return (
    <div className={`relative shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      <aside
        className="flex flex-col bg-[#025864] sticky top-0 h-screen overflow-y-auto"
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Route size={16} className="text-[#00D47E]" />
          </div>
          {!collapsed && (
            <span className="font-extrabold text-lg text-white tracking-tight whitespace-nowrap">
              i-RAMS
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {!collapsed && (
            <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest px-2 mb-3">
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
                  relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-semibold transition-all duration-150
                  ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-[#00D47E]'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#00D47E] rounded-r-full" />
                )}
                <Icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-[#00D47E]' : 'text-white/40'}`}
                />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile + Logout */}
        <div className="px-3 py-4 border-t border-white/10 space-y-3">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-[#00D47E] flex items-center justify-center text-[#025864] text-xs font-bold shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {userName || 'User'}
                </p>
                <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md ${roleColor}`}>
                  {roleLabel}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            title={collapsed ? 'Log out' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-xl
              text-xs font-semibold text-white/40
              hover:bg-red-500/10 hover:text-red-400 transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Collapse Toggle — outside aside so it cannot be clipped */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="
          absolute -right-3 top-[72px] z-20
          w-6 h-6 rounded-full bg-white border border-slate-200
          flex items-center justify-center shadow-sm
          hover:bg-[#025864]/5 hover:border-[#025864]/20 transition-all
        "
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={12} className="text-slate-400" />
          : <ChevronLeft size={12} className="text-slate-400" />
        }
      </button>
    </div>
  );
};

export default Sidebar;