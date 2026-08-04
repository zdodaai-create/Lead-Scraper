import React, { useState, useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import StatCard from '../components/StatCard';
import LeadTable from '../components/LeadTable';
import LeadDetailModal from '../components/LeadDetailModal';
import ProgressOverlay from '../components/ProgressOverlay';
import Toast from '../components/Toast';

import { searchService, leadService, exportService } from '../services/api';
import { Users, Phone, Mail, Globe, AlertCircle, FileSpreadsheet, FileText, Trash2, AlertTriangle } from 'lucide-react';

const DEFAULT_SUMMARY = {
  total_leads: 0,
  with_phone: 0,
  with_email: 0,
  with_website: 0,
  without_email: 0,
};

const Dashboard = ({ searchQuery }) => {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [activeSearchId, setActiveSearchId] = useState(null);
  const [searchError, setSearchError] = useState('');

  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('collected_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchLeads = async (customPage = page, customSortBy = sortBy, customSortOrder = sortOrder) => {
    try {
      const res = await leadService.getLeads({
        query: searchQuery,
        search_id: activeSearchId,
        sort_by: customSortBy,
        sort_order: customSortOrder,
        page: customPage,
        limit: 50,
      });

      if (res) {
        if (Array.isArray(res.items)) {
          setLeads(res.items);
        }
        if (res.summary) {
          setSummary({
            total_leads: res.summary.total_leads || 0,
            with_phone: res.summary.with_phone || 0,
            with_email: res.summary.with_email || 0,
            with_website: res.summary.with_website || 0,
            without_email: res.summary.without_email || 0,
          });
        }
        if (res.page) setPage(res.page);
        if (res.total_pages) setTotalPages(res.total_pages);
        if (res.total !== undefined) setTotalItems(res.total);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  useEffect(() => {
    fetchLeads(1, sortBy, sortOrder);
  }, [searchQuery, activeSearchId]);

  const handleSearchSubmit = async (params) => {
    setLoading(true);
    setSearchError('');
    try {
      const data = await searchService.findLeads(params);
      if (data) {
        if (data.search?.id) setActiveSearchId(data.search.id);
        if (Array.isArray(data.leads)) setLeads(data.leads);
        if (data.summary) {
          setSummary({
            total_leads: data.summary.total_leads || 0,
            with_phone: data.summary.with_phone || 0,
            with_email: data.summary.with_email || 0,
            with_website: data.summary.with_website || 0,
            without_email: data.summary.without_email || 0,
          });
          setTotalItems(data.summary.total_leads || 0);
        }
        setTotalPages(1);
        setPage(1);

        if (!data.summary || data.summary.total_leads === 0) {
          setSearchError('Google Places API returned 0 leads for this search. Please check your region/category or verify Places API permissions in Google Cloud Console.');
        } else {
          setToast({
            message: `Found & enriched ${data.summary.total_leads} verified leads for ${params.region}!`,
            type: 'success',
          });
        }
      }
    } catch (err) {
      console.error('[Lead Finder Network/API Diagnostics]:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data,
        requestURL: err.config?.url || err.request?.responseURL
      });

      let errMsg = 'Unable to connect to the Lead Finder backend.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errMsg = 'Unable to connect to the Lead Finder backend.';
      } else if (err.message) {
        errMsg = err.message;
      }
      
      setSearchError(errMsg);
      setToast({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === (leads || []).length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds((leads || []).map((l) => l.id));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await leadService.updateLead(id, { lead_status: newStatus });
      setLeads((prev) =>
        (prev || []).map((l) => (l.id === id ? { ...l, lead_status: newStatus } : l))
      );
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) => ({ ...prev, lead_status: newStatus }));
      }
      setToast({ message: `Updated lead status to '${newStatus}'`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleSaveNotes = async (id, notesText) => {
    try {
      await leadService.updateLead(id, { notes: notesText });
      setLeads((prev) =>
        (prev || []).map((l) => (l.id === id ? { ...l, notes: notesText } : l))
      );
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) => ({ ...prev, notes: notesText }));
      }
      setToast({ message: 'Internal notes saved', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to save notes', type: 'error' });
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead record?')) return;
    try {
      await leadService.deleteLead(id);
      setLeads((prev) => (prev || []).filter((l) => l.id !== id));
      setSelectedLeadIds((prev) => (prev || []).filter((item) => item !== id));
      setToast({ message: 'Lead deleted', type: 'success' });
      fetchLeads(page);
    } catch (err) {
      setToast({ message: 'Failed to delete lead', type: 'error' });
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedLeadIds.length) return;
    if (!window.confirm(`Delete ${selectedLeadIds.length} selected leads?`)) return;
    try {
      await leadService.batchDeleteLeads(selectedLeadIds);
      setSelectedLeadIds([]);
      setToast({ message: 'Batch deletion complete', type: 'success' });
      fetchLeads(page);
    } catch (err) {
      setToast({ message: 'Batch delete failed', type: 'error' });
    }
  };

  const handleExportExcel = async () => {
    try {
      let blob;
      if (selectedLeadIds.length > 0) {
        blob = await exportService.exportSelected(selectedLeadIds, 'excel');
      } else {
        blob = await exportService.downloadExcel(activeSearchId);
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lead_Finder_Export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ message: 'Excel export downloaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Export failed. Make sure leads exist.', type: 'error' });
    }
  };

  const handleExportCSV = async () => {
    try {
      let blob;
      if (selectedLeadIds.length > 0) {
        blob = await exportService.exportSelected(selectedLeadIds, 'csv');
      } else {
        blob = await exportService.downloadCSV(activeSearchId);
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lead_Finder_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ message: 'CSV export downloaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Export failed. Make sure leads exist.', type: 'error' });
    }
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setToast({ message: `${label} copied!`, type: 'info' });
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    fetchLeads(1, newSortBy, newSortOrder);
  };

  const safeSummary = summary || DEFAULT_SUMMARY;

  return (
    <div class="space-y-6">
      {/* Search Form */}
      <SearchForm onSubmit={handleSearchSubmit} loading={loading} />

      {/* Error Alert Banner */}
      {searchError && (
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-300 shadow-md">
          <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="font-bold text-amber-200 text-sm">
              {searchError.includes('GOOGLE_MAPS_API_KEY') || searchError.includes('Google Places') || searchError.includes('API key')
                ? 'Google Places API Status Message'
                : 'Backend Connection Status'}
            </h4>
            <p class="mt-1 text-slate-200 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded border border-slate-800 break-all">
              {searchError}
            </p>
            <div class="mt-2 text-[11px] text-slate-400">
              {searchError.includes('GOOGLE_MAPS_API_KEY') || searchError.includes('Google Places') || searchError.includes('API key') ? (
                <span>💡 <strong>Note:</strong> Ensure <code>GOOGLE_MAPS_API_KEY</code> is properly configured in your Render environment variables.</span>
              ) : (
                <span>💡 <strong>Note:</strong> Verify backend deployment status on Render at <code>https://lead-finder-single-app.onrender.com/health</code>.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Leads"
          value={safeSummary.total_leads || 0}
          icon={Users}
          color="blue"
          description="Verified place results"
        />
        <StatCard
          title="With Phone"
          value={safeSummary.with_phone || 0}
          icon={Phone}
          color="emerald"
          description="Public phone listed"
        />
        <StatCard
          title="With Email"
          value={safeSummary.with_email || 0}
          icon={Mail}
          color="purple"
          description="Website enriched emails"
        />
        <StatCard
          title="With Website"
          value={safeSummary.with_website || 0}
          icon={Globe}
          color="amber"
          description="Official domain found"
        />
        <StatCard
          title="Without Email"
          value={safeSummary.without_email || 0}
          icon={AlertCircle}
          color="rose"
          description="No public email found"
        />
      </div>

      {/* Toolbar & Export Action Buttons */}
      <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <h3 class="text-sm font-bold text-white">Discovered Leads List</h3>
          {selectedLeadIds.length > 0 && (
            <span class="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-semibold">
              {selectedLeadIds.length} selected
            </span>
          )}
        </div>

        <div class="flex items-center gap-3">
          {selectedLeadIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedLeadIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet class="w-4 h-4" />
            <span>{selectedLeadIds.length ? 'EXPORT SELECTED (EXCEL)' : 'EXPORT EXCEL'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <FileText class="w-4 h-4 text-blue-400" />
            <span>{selectedLeadIds.length ? 'EXPORT SELECTED (CSV)' : 'EXPORT CSV'}</span>
          </button>
        </div>
      </div>

      {/* Main Results Table */}
      <LeadTable
        leads={leads || []}
        selectedLeadIds={selectedLeadIds}
        onSelectLead={handleSelectLead}
        onSelectAll={handleSelectAll}
        onViewLead={(lead) => setSelectedLead(lead)}
        onDeleteLead={handleDeleteLead}
        onUpdateStatus={handleUpdateStatus}
        onCopyText={handleCopyText}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(newPage) => fetchLeads(newPage)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSaveNotes={handleSaveNotes}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Progress Drawer Overlay */}
      <ProgressOverlay isVisible={loading} />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Dashboard;
