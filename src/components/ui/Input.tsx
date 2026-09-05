import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300 mb-1.5 overflow-visible">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full text-sm rounded-lg border bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors py-2 ${
              icon ? 'pl-9' : 'pl-3'
            } pr-3 ${
              error
                ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-300 dark:border-navy-700 focus:ring-emerald-500 focus:border-emerald-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
