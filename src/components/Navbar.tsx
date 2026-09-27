import React, { useState, useEffect } from 'react';
import {
  Activity,
  UploadCloud,
  Layers,
  BrainCircuit,
  FileText,
  Download,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  Building2,
  AlertCircle
} from 'lucide-react';
import type { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: UserRole) => void;
  demoUsers: User[];
  openAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchRole,
  demoUsers,
  openAlertCount
}) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'patients', label: 'Follow-Up Queue', icon: UserCheck },
    { id: 'import', label: 'Dataset Import', icon: UploadCloud },
    { id: 'linkage', label: 'Data Linkage', icon: Layers },
    { id: 'ml', label: 'LTFU ML & Risk', icon: BrainCircuit },
    { id: 'methodology', label: 'Methodology & Docs', icon: FileText },
    { id: 'exports', label: 'Submissions', icon: Download }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      {/* Top Banner with App Identity and User Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-lg text-white shadow-sm">
              RH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-white">
                  Rural Health Follow-Up Assurance
                </span>
                <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded">
                  Ayushman Arogya Mandir
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                National Non-Communicable Disease Continuum Platform · District Balrampur
              </p>
            </div>
          </div>

          {/* Right Side: Network Status & Role Selector */}
          <div className="flex items-center gap-3">
            {/* Connectivity Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded text-xs">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">ONLINE</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-300 font-medium">OFFLINE CACHED</span>
                </>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Role: <span className="text-teal-400 font-semibold">{currentUser?.role.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs text-white truncate max-w-[130px]">
                    {currentUser?.name}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                    Switch Staff Role (Demo Credentials)
                  </div>
                  {demoUsers.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        onSwitchRole(user.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors flex items-center justify-between ${
                        currentUser?.role === user.role ? 'bg-slate-800/60 text-teal-400 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-100">{user.role.replace('_', ' ')}</div>
                        <div className="text-slate-400 text-[11px]">{user.name} · {user.facilityName}</div>
                      </div>
                      {currentUser?.role === user.role && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      )}
                    </button>
                  ))}
                  <div className="px-3 py-1.5 border-t border-slate-800 text-[10px] text-slate-500">
                    ABDM role authorization enforced at API gateway.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800 text-sm">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showAlertBadge = item.id === 'patients' && openAlertCount > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {showAlertBadge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {openAlertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
