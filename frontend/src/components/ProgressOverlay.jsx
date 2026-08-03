import React, { useEffect, useState } from 'react';
import { Search, Globe, ShieldCheck, Database, CheckCircle2, Sparkles } from 'lucide-react';

const steps = [
  { id: 1, label: 'Searching businesses via Places API...', icon: Search },
  { id: 2, label: 'Gathering Place Details & Official Websites...', icon: Globe },
  { id: 3, label: 'Visiting public pages (/contact, /about)...', icon: Globe },
  { id: 4, label: 'Extracting public business emails (info@, contact@)...', icon: Sparkles },
  { id: 5, label: 'Running SSRF guard & multi-criteria deduplication...', icon: ShieldCheck },
  { id: 6, label: 'Saving verified leads to database...', icon: Database },
];

const ProgressOverlay = ({ isVisible }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      return;
    }

    // Step intervals (350ms per step for snappy, responsive feel)
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 350);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center mb-3">
            <Sparkles class="w-6 h-6 animate-pulse text-blue-400" />
          </div>
          <h3 class="text-lg font-bold text-white">Discovering & Enriching Leads</h3>
          <p class="text-xs text-slate-400 mt-1">Extracting verified public business contact information</p>
        </div>

        <div class="space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                    : isCurrent
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-md font-semibold'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div class="shrink-0">
                  {isDone ? (
                    <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Icon class="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <span class="text-xs">{step.label}</span>
              </div>
            );
          })}
        </div>

        <div class="mt-6 pt-4 border-t border-slate-800 text-center">
          <div class="text-[11px] text-slate-400">
            Processing fast asynchronous pipeline...
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverlay;
