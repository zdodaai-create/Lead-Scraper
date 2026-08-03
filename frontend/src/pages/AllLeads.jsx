import React, { useState, useEffect } from 'react';
import LeadTable from '../components/LeadTable';
import LeadDetailModal from '../components/LeadDetailModal';
import Toast from '../components/Toast';
import { leadService, exportService } from '../services/api';
import { Users, Filter, FileSpreadsheet, FileText, Trash2, Search as SearchIcon } from 'lucide-react';

const AllLeads = ({ searchQuery }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    lead_status: '',
    has_email: '',
    has_phone: '',
    has_website: '',
  });

  // Pagination & Sort
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('collected_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchLeadsData = async (customPage = page, customSortBy = sortBy, customSortOrder = sortOrder) => {
    try {
      const params = {
        query: searchQuery,
        category: filters.category || undefined,
        city: filters.city || undefined,
        lead_status: filters.lead_status || undefined,
        has_email: filters.has_email === 'true' ? true : filters.has_email === 'false' ? false : undefined,
        has_phone: filters.has_phone === 'true' ? true : filters.has_phone === 'false' ? false : undefined,
        has_website: filters.has_website === 'true' ? true : filters.has_website === 'false' ? false : undefined,
        sort_by: customSortBy,
        sort_order: customSortOrder,
        page: customPage,
        limit: 50,
      };

      const res = await leadService.getLeads(params);
      setLeads(res.items);
      setPage(res.page);
      setTotalPages(res.total_pages);
      setTotalItems(res.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeadsData(1, sortBy, sortOrder);
  }, [searchQuery, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
      fetchLeadsData(page);
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
      fetchLeadsData(page);
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
        blob = await exportService.downloadExcel();
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lead_Finder_AllLeads_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ message: 'Excel export downloaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Export failed', type: 'error' });
    }
  };

  const handleExportCSV = async () => {
    try {
      let blob;
      if (selectedLeadIds.length > 0) {
        blob = await exportService.exportSelected(selectedLeadIds, 'csv');
      } else {
        blob = await exportService.downloadCSV();
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lead_Finder_AllLeads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ message: 'CSV export downloaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Export failed', type: 'error' });
    }
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setToast({ message: `${label} copied!`, type: 'info' });
  };

  return (
    <div class="space-y-6">
      {/* Header Bar */}
      <div class="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-blue-400" />
            <h2 class="text-lg font-bold text-white">All Lead Database</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Browse, filter, manage, and update statuses across all gathered business leads
          </p>
        </div>
        <span class="text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg">
          {totalItems} Total Records
        </span>
      </div>

      {/* Filter Bar */}
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">City / Region</label>
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            placeholder="e.g. Trivandrum"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            placeholder="e.g. Software"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Lead Status</label>
          <select
            name="lead_status"
            value={filters.lead_status}
            onChange={handleFilterChange}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Interested">Interested</option>
            <option value="Converted">Converted</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Has Email</label>
          <select
            name="has_email"
            value={filters.has_email}
            onChange={handleFilterChange}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Any Email</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Has Phone</label>
          <select
            name="has_phone"
            value={filters.has_phone}
            onChange={handleFilterChange}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Any Phone</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Has Website</label>
          <select
            name="has_website"
            value={filters.has_website}
            onChange={handleFilterChange}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Any Website</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      {/* Action Toolbar */}
      <div class="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div class="text-xs text-slate-400">
          Showing <span class="font-bold text-white">{leads.length}</span> leads on page {page}
        </div>

        <div class="flex items-center gap-3">
          {selectedLeadIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete ({selectedLeadIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <FileSpreadsheet class="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>

          <button
            onClick={handleExportCSV}
            class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <FileText class="w-4 h-4 text-blue-400" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
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
        onPageChange={(newPage) => fetchLeadsData(newPage)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(newSort, newOrder) => {
          setSortBy(newSort);
          setSortOrder(newOrder);
          fetchLeadsData(1, newSort, newOrder);
        }}
      />

      {/* Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSaveNotes={handleSaveNotes}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default AllLeads;
