import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperNavProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { step: 1, label: '1. Project Details' },
  { step: 2, label: '2. Project Team' },
  { step: 3, label: '3. Accepted Baseline' },
  { step: 4, label: '4. Schedule & Milestones' },
  { step: 5, label: '5. Review & Activate' },
];

export const WizardStepperNav: React.FC<WizardStepperNavProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0 hidden md:block" />

        {STEPS.map((s) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <div
              key={s.step}
              onClick={() => {
                if (s.step <= currentStep) onStepClick(s.step);
              }}
              className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group ${
                s.step > currentStep ? 'pointer-events-none' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#AB9570] text-slate-950 ring-4 ring-[#AB9570]/20'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.step}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight transition-colors hidden sm:block ${
                  isCurrent
                    ? 'text-slate-900 font-bold'
                    : isCompleted
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
