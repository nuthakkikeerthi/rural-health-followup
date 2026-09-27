import React, { useState, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { User, UserRole } from '../types';

interface AppHeaderProps {
  currentUser: User | null;
  activeTab: string;
  onSwitchRole: (role: UserRole) => void;
  demoUsers: User[];
  onToggleMobileSidebar: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  activeTab,
  onSwitchRole,
  demoUsers,
  onToggleMobileSidebar
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Continuity Dashboard';
      case 'queue':
        return 'Follow-Up Queue';
      case 'patients':
        return 'Patient Directory';
      case 'alerts':
        return 'Actionable Alerts';
      case 'analytics':
        return 'Executive Analytics';
      case 'admin':
        return 'Admin / Data Management';
      case 'methodology':
        return 'Clinical Methodology & Protocols';
      default:
        return 'Healthcare Operations';
    }
  };

  const getRoleDisplayName = (role?: UserRole) => {
    switch (role) {
      case 'ASHA':
        return 'ASHA Worker';
      case 'CHO':
        return 'Community Health Officer (CHO)';
      case 'DOCTOR':
        return 'Medical Officer (Doctor)';
      case 'DISTRICT_ADMIN':
        return 'District Health Admin';
      default:
        return 'Staff User';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="text-[11px] font-medium text-slate-400">
              Operations / {getPageTitle(activeTab)}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {getPageTitle(activeTab)}
            </h1>
          </div>
        </div>

        {/* Right Side: Network Status & Staff Role Selector */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-slate-200 bg-slate-50 text-slate-600">
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-[11px]">Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-medium text-[11px] text-amber-700">Offline Cached</span>
              </>
            )}
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-900 leading-tight">
                  {currentUser?.name}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  {getRoleDisplayName(currentUser?.role)}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-2 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Operational Role (Demo Profiles)
                </div>
                <div className="py-1">
                  {demoUsers.map(user => {
                    const isSelected = currentUser?.role === user.role;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          onSwitchRole(user.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-start justify-between ${
                          isSelected ? 'bg-teal-50/80 text-teal-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {getRoleDisplayName(user.role)}
                            {isSelected && (
                              <span className="text-[10px] bg-teal-600 text-white font-medium px-1.5 py-0.2 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {user.name} · {user.facilityName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
                  Select a role above to test permissions and operational views.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
