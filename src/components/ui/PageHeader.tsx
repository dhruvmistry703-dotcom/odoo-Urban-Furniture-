import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string; path?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  action,
  actions,
  breadcrumbs,
}) => {
  const displaySubtitle = subtitle || description;
  const displayAction = action || actions;

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'font-medium text-slate-700 dark:text-slate-300' : ''}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {displaySubtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{displaySubtitle}</p>}
      </div>
      {displayAction && <div className="flex items-center gap-3 shrink-0">{displayAction}</div>}
    </div>
  );
};
