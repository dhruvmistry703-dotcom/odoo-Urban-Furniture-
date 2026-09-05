import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export interface StepItem {
  label: string;
  isDone: boolean;
  refCode?: string;
  isCurrent?: boolean;
}

interface LifecycleStepperProps {
  steps: StepItem[];
}

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({ steps }) => {
  return (
    <div className="bg-slate-50 dark:bg-navy-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-navy-700/60 mb-6">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        Financial Transaction Lifecycle
      </h4>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                step.isDone
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                  : step.isCurrent
                  ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 shadow-sm ring-1 ring-blue-400'
                  : 'bg-white text-slate-400 border-slate-200 dark:bg-navy-800 dark:text-slate-500 dark:border-navy-700'
              }`}
            >
              {step.isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 ${
                    step.isCurrent ? 'border-blue-500 bg-blue-100' : 'border-slate-300 dark:border-navy-600'
                  }`}
                />
              )}
              <div className="flex flex-col">
                <span>{step.label}</span>
                {step.refCode && (
                  <span className="text-[10px] font-normal opacity-80">{step.refCode}</span>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-navy-600 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
