import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowLeft, LayoutGrid, List } from 'lucide-react';

interface MasterToolbarProps {
  title?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  activeView: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
  onNewClick: () => void;
  onBackClick?: () => void;
  newButtonText?: string;
  selectedCount?: number;
  extraActions?: React.ReactNode;
}

export const MasterToolbar: React.FC<MasterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  activeView,
  onViewChange,
  onNewClick,
  onBackClick,
  newButtonText = 'New',
  selectedCount = 0,
  extraActions,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 sm:p-4 shadow-sm transition-all duration-200">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left Side: New Button & Optional Batch Info */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNewClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
            title="Create new record"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{newButtonText}</span>
          </button>

          {selectedCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              {selectedCount} selected
            </span>
          )}

          {extraActions}
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-900/90 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Back Button & View Switchers */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700 transition-all active:scale-[0.98]"
            title="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* View Switcher Toggle (Matches Wireframe Sketch with distinct active border/indicator) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-750">
            <button
              type="button"
              onClick={() => onViewChange('list')}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                activeView === 'list'
                  ? 'bg-white dark:bg-navy-700 text-emerald-600 dark:text-emerald-400 shadow-xs ring-2 ring-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Switch to List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange('kanban')}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                activeView === 'kanban'
                  ? 'bg-white dark:bg-navy-700 text-emerald-600 dark:text-emerald-400 shadow-xs ring-2 ring-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Switch to Kanban View"
              aria-label="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
