import React, { useState, useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import StatCard from '../components/StatCard';
import LeadTable from '../components/LeadTable';
import LeadDetailModal from '../components/LeadDetailModal';
import ProgressOverlay from '../components/ProgressOverlay';
import Toast from '../components/Toast';

import { searchService, leadService, exportService } from '../services/api';
import { Users, Phone, Mail, Globe, AlertCircle, FileSpreadsheet, FileText, Trash2, AlertTriangle } from 'lucide-react';

const Dashboard = ({ searchQuery }) => {
  const [summary, setSummary] = useState({
    total_leads: 0,
    with_phone: 0,
    with_email: 0,
    with_website: 0,
    without_email: 0,
  });

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

      setLeads(res.items);
      setSummary(res.summary);
      setPage(res.page);
      setTotalPages(res.total_pages);
      setTotalItems(res.total);
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
      setActiveSearchId(data.search.id);
      setLeads(data.leads);
      setSummary(data.summary);
      setTotalItems(data.summary.total_leads);
      setTotalPages(1);
      setPage(1);

      if (data.summary.total_leads === 0) {
        setSearchError('Google Places API returned 0 leads for this search. Please check your region/category or verify Places API permissions in Google Cloud Console.');
      } else {
        setToast({
          message: `Found & enriched ${data.summary.total_leads} verified leads for ${params.region}!`,
          type: 'success',
        });
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to search leads via Google Places API.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errMsg = err.response.data.detail;
        } else {
          errMsg = JSON.stringify(err.response.data.detail);
        }
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
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await leadService.updateLead(id, { lead_status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, lead_status: newStatus } : l))
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
        prev.map((l) => (l.id === id ? { ...l, notes: notesText } : l))
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
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
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

  return (
    <div class="space-y-6">
      {/* Search Form */}
      <SearchForm onSubmit={handleSearchSubmit} loading={loading} />

      {/* Error Alert Banner */}
      {searchError && (
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-300 shadow-md">
          <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="font-bold text-amber-200 text-sm">Google Places API Status Message</h4>
            <p class="mt-1 text-slate-200 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded border border-slate-800 break-all">
              {searchError}
            </p>
            <div class="mt-2 text-[11px] text-slate-400">
              💡 <strong>Quick Fix:</strong> If testing UI without live API credits, set <code>DEMO_MODE=true</code> in <code>backend/.env</code>.
            </div>
          </div>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Leads"
          value={summary.total_leads}
          icon={Users}
          color="blue"
          description="Verified place results"
        />
        <StatCard
          title="With Phone"
          value={summary.with_phone}
          icon={Phone}
          color="emerald"
          description="Public phone listed"
        />
        <StatCard
          title="With Email"
          value={summary.with_email}
          icon={Mail}
          color="purple"
          description="Website enriched emails"
        />
        <StatCard
          title="With Website"
          value={summary.with_website}
          icon={Globe}
          color="amber"
          description="Official domain found"
        />
        <StatCard
          title="Without Email"
          value={summary.without_email}
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
        leads={leads}
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
