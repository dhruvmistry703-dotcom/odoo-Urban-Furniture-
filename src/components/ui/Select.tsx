import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, required, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300 mb-1.5 overflow-visible">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full text-sm rounded-lg border bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 transition-colors py-2 px-3 ${
            error
              ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-300 dark:border-navy-700 focus:ring-emerald-500 focus:border-emerald-500'
          } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
