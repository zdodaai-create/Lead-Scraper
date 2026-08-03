import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  return (
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div class={`p-2 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
            <Icon class="w-4 h-4" />
          </div>
        )}
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-white tracking-tight">{value}</span>
      </div>
      {description && (
        <p class="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </div>
  );
};

export default StatCard;
