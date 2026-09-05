import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  noPadding = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-navy-800/90 rounded-xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm transition-all duration-200 overflow-visible ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-navy-700/60">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
};
