import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Menu, LogOut, ChevronDown, UserCheck, Hammer, Armchair } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const pathParts = location.pathname.split('/').filter(Boolean);
  let pageTitle = 'Dashboard';

  if (pathParts.length > 0) {
    const raw = pathParts[0];
    pageTitle = raw
      .replace('-', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    if (pageTitle === 'Reports' && pathParts[1]) {
      pageTitle = `Report: ${pathParts[1].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }
  }

  const notifications = [
    { id: 1, title: 'Teak Logs Purchase PO-00012 Delivered', time: '10m ago', unread: true },
    { id: 2, title: 'Invoice INV-00045 Paid by ABC Furniture', time: '1h ago', unread: true },
    { id: 3, title: 'Workshop Assembly Completed for SO-00046', time: '1d ago', unread: false },
  ];

  return (
    <>
      <header className="h-16 bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-navy-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors shadow-2xs">
        {/* Left Side: Mobile Hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 mb-0.5">
              <span className="flex items-center gap-1"><Armchair className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /> Urban Furniture</span>
              <span>/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{pageTitle}</span>
            </nav>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{pageTitle}</h2>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Furniture Workshop Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Hammer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Woodcraft Studio</span>
          </div>

          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs border border-transparent hover:border-slate-300 dark:hover:border-navy-700 transition-all"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search ERP...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-navy-900 text-slate-400 rounded border border-slate-200 dark:border-navy-700">
              Ctrl+K
            </kbd>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-navy-900" />
            </button>

            {isNotificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 p-3 z-30 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsNotificationsOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-navy-700">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Workshop Notifications</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">2 New</span>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        n.unread ? 'bg-slate-50 dark:bg-navy-700/60 font-medium' : 'opacity-70'
                      }`}
                    >
                      <p className="text-slate-800 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-navy-800 hidden sm:block" />

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/30"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name || 'User'}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">{user?.role || ''}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 p-2 z-30 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-navy-700 mb-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <UserCheck className="w-3 h-3" /> Role: {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700 rounded-lg transition-colors"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
