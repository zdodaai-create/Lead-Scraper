import React from 'react';
import { Play, Trash2, MapPin, Building2, Calendar, Radius } from 'lucide-react';

const SavedSearchCard = ({ search, onRerun, onDelete }) => {
  return (
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <h3 class="text-sm font-bold text-white truncate" title={search.name}>
            {search.name}
          </h3>
          <span class="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold shrink-0">
            {search.max_results} Max
          </span>
        </div>

        <div class="space-y-2 text-xs text-slate-300">
          <div class="flex items-center gap-2">
            <MapPin class="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span class="truncate">{search.region}, {search.state || ''} ({search.country})</span>
          </div>

          <div class="flex items-center gap-2">
            <Building2 class="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span class="truncate">{search.category}</span>
          </div>

          <div class="flex items-center gap-2 text-slate-400">
            <Radius class="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Radius: {search.radius_km} KM</span>
          </div>

          <div class="flex items-center gap-2 text-slate-500 text-[11px] pt-1">
            <Calendar class="w-3 h-3 shrink-0" />
            <span>Saved on {new Date(search.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onDelete(search.id)}
          title="Delete Saved Search"
          class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Trash2 class="w-4 h-4" />
        </button>

        <button
          onClick={() => onRerun(search)}
          class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
        >
          <Play class="w-3.5 h-3.5 fill-white" />
          <span>Rerun Search</span>
        </button>
      </div>
    </div>
  );
};

export default SavedSearchCard;
