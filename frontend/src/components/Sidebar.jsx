import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Bookmark, 
  Users, 
  Download, 
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Find Leads', path: '/find-leads', icon: Search },
  { name: 'Saved Searches', path: '/saved-searches', icon: Bookmark },
  { name: 'All Leads', path: '/leads', icon: Users },
  { name: 'Exports', path: '/exports', icon: Download },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

const Sidebar = () => {
  return (
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div class="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="font-extrabold text-lg text-white tracking-tight">LEAD FINDER</h1>
            <span class="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block -mt-1">
              Enterprise Lead Engine
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav class="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon class="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div class="p-4 border-t border-slate-800/80">
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div class="text-xs font-semibold text-slate-300">Google Places & Web Crawler</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Enrichment Mode: Active</div>
          <div class="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="bg-blue-500 h-full w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
