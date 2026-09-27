import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BellRing,
  BarChart3,
  HelpCircle,
  Database,
  HeartPulse,
  X
} from 'lucide-react';
import type { User } from '../types';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  openAlertCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  openAlertCount,
  mobileOpen,
  setMobileOpen
}) => {
  const isDistrictAdmin = currentUser?.role === 'DISTRICT_ADMIN';

  const operationalNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'queue', label: 'Follow-Up Queue', icon: ClipboardList },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: openAlertCount > 0 ? openAlertCount : null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              Rural Health
            </div>
            <div className="text-[11px] text-slate-500 font-medium leading-tight">
              Follow-Up Assurance
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Facility & Role Context Pill */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 text-xs">
        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Facility Context
        </div>
        <div className="font-medium text-slate-800 truncate mt-0.5">
          {currentUser?.facilityName || 'Ayushman Arogya Mandir'}
        </div>
        <div className="text-[11px] text-teal-700 font-medium">
          {currentUser?.block}, {currentUser?.district}
        </div>
      </div>

      {/* Main Navigation (Clean & Minimal) */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Operations
        </div>
        {operationalNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin / Data Management (Visible ONLY to District Admin) */}
        {isDistrictAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Administration
            </div>
            <button
              type="button"
              onClick={() => handleSelectTab('admin')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className={`w-4 h-4 ${activeTab === 'admin' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>Admin / Data Management</span>
              </div>
              <span className="text-[10px] text-teal-700 bg-teal-100/70 font-semibold px-1.5 py-0.2 rounded">
                Admin
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          type="button"
          onClick={() => handleSelectTab('methodology')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'methodology'
              ? 'bg-teal-50 text-teal-800 font-semibold'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help / Methodology</span>
        </button>

        <div className="px-3 pt-2 text-[10px] text-slate-400 leading-tight">
          ABDM & NCD Continuum · v2.4
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-xl z-10 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
