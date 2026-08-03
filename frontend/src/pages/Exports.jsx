import React, { useState, useEffect } from 'react';
import { exportService, searchService } from '../services/api';
import Toast from '../components/Toast';
import { Download, FileSpreadsheet, FileText, CheckCircle2, Search } from 'lucide-react';

const Exports = () => {
  const [searches, setSearches] = useState([]);
  const [selectedSearchId, setSelectedSearchId] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchSearches = async () => {
      try {
        const data = await searchService.getSavedSearches();
        setSearches(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSearches();
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      let blob;
      const searchId = selectedSearchId ? parseInt(selectedSearchId, 10) : null;
      if (exportFormat === 'excel') {
        blob = await exportService.downloadExcel(searchId);
      } else {
        blob = await exportService.downloadCSV(searchId);
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lead_Finder_Export_${Date.now()}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ message: 'Export file downloaded successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to generate export file.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <Download class="w-5 h-5 text-blue-400" />
            <h2 class="text-lg font-bold text-white">Export Center</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Export full lead lists or specific search sessions to Excel (.xlsx) or CSV format.
          </p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg space-y-6">
        {/* Search Session Selector */}
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase mb-2">Select Search Session</label>
          <select
            value={selectedSearchId}
            onChange={(e) => setSelectedSearchId(e.target.value)}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Export All Leads in Database</option>
            {searches.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.region} - {s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Format Selection Cards */}
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase mb-3">Select Export Format</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Excel Option */}
            <div
              onClick={() => setExportFormat('excel')}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                exportFormat === 'excel'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div class="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                <FileSpreadsheet class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <div class="font-bold text-sm text-white flex items-center justify-between">
                  <span>Excel Spreadsheet (.xlsx)</span>
                  {exportFormat === 'excel' && <CheckCircle2 class="w-4 h-4 text-emerald-400" />}
                </div>
                <p class="text-xs text-slate-400 mt-1">
                  Fully formatted workbook with structured columns ready for Microsoft Excel & Google Sheets.
                </p>
              </div>
            </div>

            {/* CSV Option */}
            <div
              onClick={() => setExportFormat('csv')}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                exportFormat === 'csv'
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div class="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                <FileText class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <div class="font-bold text-sm text-white flex items-center justify-between">
                  <span>Comma-Separated (.csv)</span>
                  {exportFormat === 'csv' && <CheckCircle2 class="w-4 h-4 text-blue-400" />}
                </div>
                <p class="text-xs text-slate-400 mt-1">
                  Lightweight CSV file with UTF-8 BOM encoding for CRM import & data pipelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Trigger */}
        <div class="pt-4 border-t border-slate-800">
          <button
            onClick={handleExport}
            disabled={loading}
            class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Download class="w-5 h-5" />
                <span>GENERATE & DOWNLOAD FILE</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Exports;
