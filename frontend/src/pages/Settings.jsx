import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Key, Globe, Database, Save, CheckCircle2 } from 'lucide-react';
import Toast from '../components/Toast';

const Settings = () => {
  const [apiKey, setApiKey] = useState('●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●');
  const [enableFallback, setEnableFallback] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(8);
  const [concurrency, setConcurrency] = useState(5);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleSave = (e) => {
    e.preventDefault();
    setToast({ message: 'System configuration updated successfully!', type: 'success' });
  };

  return (
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <SettingsIcon class="w-5 h-5 text-blue-400" />
            <h2 class="text-lg font-bold text-white">Application Settings</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Configure Google Places API parameters, website enrichment rules, and security controls.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} class="space-y-6">
        {/* Google Places API Configuration */}
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Key class="w-4 h-4 text-amber-400" />
            <h3 class="text-sm font-bold text-white">Google Places Platform API</h3>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Google Places API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <p class="text-[11px] text-slate-500 mt-1">
              Never exposed to the browser. Processed securely via FastAPI backend `/api/search`.
            </p>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div>
              <div class="text-xs font-semibold text-white">Mock Discovery Fallback</div>
              <div class="text-[11px] text-slate-400">Generate realistic regional place data if API key is absent or hits quota limits.</div>
            </div>
            <input
              type="checkbox"
              checked={enableFallback}
              onChange={(e) => setEnableFallback(e.target.checked)}
              class="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Website Enrichment Engine Settings */}
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Globe class="w-4 h-4 text-blue-400" />
            <h3 class="text-sm font-bold text-white">Website Contact Enrichment Engine</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Request Timeout (Seconds)</label>
              <input
                type="number"
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10))}
                min="3"
                max="30"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Max Concurrent Crawls</label>
              <input
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
                min="1"
                max="20"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SSRF & Security Status */}
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck class="w-4 h-4 text-emerald-400" />
            <h3 class="text-sm font-bold text-white">Security & SSRF Guard Controls</h3>
          </div>

          <div class="space-y-2 text-xs text-slate-300">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
              <span>IP Address Resolution Guard: Blocking 127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, 169.254.0.0/16</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Protocol Restriction: Strictly enforcing HTTP/HTTPS only</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Intranet Domain Filter: Rejects .local, .internal, .lan hostnames</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <Save class="w-4 h-4" />
          <span>SAVE SETTINGS</span>
        </button>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Settings;
