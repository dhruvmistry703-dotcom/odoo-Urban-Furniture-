import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, Tag } from 'lucide-react';

interface Many2OneSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  onCreate?: (newItem: string) => string | void;
  placeholder?: string;
  required?: boolean;
}

export const Many2OneSelect: React.FC<Many2OneSelectProps> = ({
  label = 'Category',
  value,
  onChange,
  options,
  onCreate,
  placeholder = 'Select or create category...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = options.some(
    opt => opt.toLowerCase() === search.trim().toLowerCase()
  );

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setSearch('');
    setIsOpen(false);
  };

  const handleCreateAndSelect = (nameToCreate: string) => {
    const trimmed = nameToCreate.trim();
    if (!trimmed) return;
    if (onCreate) {
      onCreate(trimmed);
    }
    onChange(trimmed);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Many2one Field
          </span>
        </div>
      )}

      {/* Select Display Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer border transition-all duration-150 ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-navy-900'
            : 'border-slate-300 dark:border-navy-700 bg-slate-50/70 dark:bg-navy-900 hover:border-slate-400 dark:hover:border-navy-600'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {value ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shadow-2xs">
              {value}
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-emerald-500' : ''
          }`}
        />
      </div>

      {/* Dropdown Menu with Search & On-The-Fly Creator */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Field inside dropdown */}
          <div className="p-1 mb-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredOptions.length === 1) {
                    handleSelect(filteredOptions[0]);
                  } else if (search.trim() && !exactMatch) {
                    handleCreateAndSelect(search);
                  }
                }
              }}
              placeholder="Type to search or create..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Option list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filteredOptions.map(opt => {
              const isSelected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-750'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && !search && (
              <p className="px-3 py-3 text-center text-xs text-slate-400">
                No categories found.
              </p>
            )}

            {/* Create on the fly action */}
            {search.trim() && !exactMatch && (
              <button
                type="button"
                onClick={() => handleCreateAndSelect(search)}
                className="w-full text-left px-3 py-2 text-xs rounded-xl bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/80 transition-colors mt-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Create & save &ldquo;{search.trim()}&rdquo; on the fly</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
