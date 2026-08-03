import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Search, ShieldCheck } from 'lucide-react';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();

  return (
    <header class="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div class="flex items-center gap-4 w-1/3">
        <div class="relative w-full">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, phone, email, region..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* User Actions */}
      <div class="flex items-center gap-4">
        <div class="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium">
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>Places API & SSRF Engine Active</span>
        </div>

        {user && (
          <div class="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div class="hidden md:block text-left">
                <div class="text-sm font-medium text-slate-200">{user.name}</div>
                <div class="text-xs text-slate-400">{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
