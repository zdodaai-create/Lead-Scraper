import React, { useState } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Trash2, 
  Eye, 
  Star, 
  Globe, 
  Phone as PhoneIcon, 
  Mail as MailIcon,
  MapPin,
  Check,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  LayoutGrid,
  Linkedin,
  ChevronDown,
  UserCheck
} from 'lucide-react';

const statusBadgeColors = {
  New: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Follow Up': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Interested: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Converted: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Not Interested': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const ALL_35_COLUMNS = [
  { id: 'profileUrl', label: 'profileUrl' },
  { id: 'fullName', label: 'fullName' },
  { id: 'firstName', label: 'firstName' },
  { id: 'lastName', label: 'lastName' },
  { id: 'companyName', label: 'companyName' },
  { id: 'title', label: 'title' },
  { id: 'companyId', label: 'companyId' },
  { id: 'companyUrl', label: 'companyUrl' },
  { id: 'regularCompanyUrl', label: 'regularCompanyUrl' },
  { id: 'summary', label: 'summary' },
  { id: 'titleDescription', label: 'titleDescription' },
  { id: 'industry', label: 'industry' },
  { id: 'companyLocation', label: 'companyLocation' },
  { id: 'location', label: 'location' },
  { id: 'durationInRole', label: 'durationInRole' },
  { id: 'durationInCompany', label: 'durationInCompany' },
  { id: 'pastExperienceCompanyName', label: 'pastExperienceCompanyName' },
  { id: 'pastExperienceCompanyUrl', label: 'pastExperienceCompanyUrl' },
  { id: 'pastExperienceCompanyTitle', label: 'pastExperienceCompanyTitle' },
  { id: 'pastExperienceDate', label: 'pastExperienceDate' },
  { id: 'pastExperienceDuration', label: 'pastExperienceDuration' },
  { id: 'connectionDegree', label: 'connectionDegree' },
  { id: 'profileImageUrl', label: 'profileImageUrl' },
  { id: 'sharedConnectionsCount', label: 'sharedConnectionsCount' },
  { id: 'name', label: 'name' },
  { id: 'vmid', label: 'vmid' },
  { id: 'linkedInProfileUrl', label: 'linkedInProfileUrl' },
  { id: 'isPremium', label: 'isPremium' },
  { id: 'isOpenLink', label: 'isOpenLink' },
  { id: 'query', label: 'query' },
  { id: 'timestamp', label: 'timestamp' },
  { id: 'defaultProfileUrl', label: 'defaultProfileUrl' },
  { id: 'searchAccountProfileId', label: 'searchAccountProfileId' },
  { id: 'searchAccountProfileName', label: 'searchAccountProfileName' },
  { id: 'sys3Status', label: 'sys3 status' }
];

const LeadTable = ({
  leads,
  selectedLeadIds,
  onSelectLead,
  onSelectAll,
  onViewLead,
  onDeleteLead,
  onUpdateStatus,
  onCopyText,
  page,
  totalPages,
  totalItems,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const [viewMode, setViewMode] = useState('all_35'); // 'all_35' | 'standard' | 'linkedin' | 'custom'
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(ALL_35_COLUMNS.map(c => c.id));

  const isAllSelected = leads.length > 0 && leads.every((l) => selectedLeadIds.includes(l.id));

  const handleSortClick = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const toggleColumn = (colId) => {
    setVisibleColumns(prev => 
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  };

  const renderCellContent = (lead, colId) => {
    switch (colId) {
      case 'profileUrl': {
        const url = lead.profile_url || lead.google_maps_url;
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[140px] block font-mono">
            {url.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        ) : <span className="text-slate-600 italic">N/A</span>;
      }
      case 'fullName':
        return <span className="font-semibold text-white truncate block max-w-[150px]" title={lead.full_name || lead.name}>{lead.full_name || lead.name || 'N/A'}</span>;
      case 'firstName':
        return <span className="text-slate-300">{lead.first_name || 'N/A'}</span>;
      case 'lastName':
        return <span className="text-slate-300">{lead.last_name || 'N/A'}</span>;
      case 'companyName':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-white max-w-[160px] truncate" title={lead.company_name}>
              {lead.company_name}
            </span>
            {lead.is_demo && (
              <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded w-fit">
                DEMO DATA
              </span>
            )}
          </div>
        );
      case 'title':
        return <span className="text-slate-300 font-medium truncate max-w-[140px] block" title={lead.title || lead.category}>{lead.title || lead.category || 'N/A'}</span>;
      case 'companyId':
        return <span className="font-mono text-slate-400 text-[11px]">{lead.company_id || 'N/A'}</span>;
      case 'companyUrl': {
        const url = lead.company_url || lead.website;
        return url && url !== 'Not Available' ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[140px] block">
            {url.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        ) : <span className="text-slate-600 italic">N/A</span>;
      }
      case 'regularCompanyUrl': {
        const url = lead.regular_company_url || lead.company_url || lead.website;
        return url && url !== 'Not Available' ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 truncate max-w-[140px] block">
            {url.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        ) : <span className="text-slate-600 italic">N/A</span>;
      }
      case 'summary':
        return <span className="text-slate-400 truncate max-w-[160px] block text-[11px]" title={lead.summary || lead.notes}>{lead.summary || lead.notes || 'N/A'}</span>;
      case 'titleDescription':
        return <span className="text-slate-400 truncate max-w-[160px] block text-[11px]" title={lead.title_description}>{lead.title_description || 'N/A'}</span>;
      case 'industry':
        return <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">{lead.industry || lead.category}</span>;
      case 'companyLocation':
        return <span className="text-slate-400 truncate max-w-[130px] block">{lead.company_location || lead.city || 'N/A'}</span>;
      case 'location':
        return <span className="text-slate-400 truncate max-w-[130px] block">{lead.location || lead.city || lead.address || 'N/A'}</span>;
      case 'durationInRole':
        return <span className="text-slate-300">{lead.duration_in_role || 'N/A'}</span>;
      case 'durationInCompany':
        return <span className="text-slate-300">{lead.duration_in_company || 'N/A'}</span>;
      case 'pastExperienceCompanyName':
        return <span className="text-slate-300 truncate max-w-[130px] block">{lead.past_experience_company_name || 'N/A'}</span>;
      case 'pastExperienceCompanyUrl': {
        const url = lead.past_experience_company_url;
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[130px] block">
            {url.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        ) : <span className="text-slate-600 italic">N/A</span>;
      }
      case 'pastExperienceCompanyTitle':
        return <span className="text-slate-300 truncate max-w-[130px] block">{lead.past_experience_company_title || 'N/A'}</span>;
      case 'pastExperienceDate':
        return <span className="text-slate-400 text-[11px]">{lead.past_experience_date || 'N/A'}</span>;
      case 'pastExperienceDuration':
        return <span className="text-slate-400 text-[11px]">{lead.past_experience_duration || 'N/A'}</span>;
      case 'connectionDegree':
        return lead.connection_degree ? (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono text-[10px]">
            {lead.connection_degree}
          </span>
        ) : <span className="text-slate-600">N/A</span>;
      case 'profileImageUrl':
        return lead.profile_image_url ? (
          <img src={lead.profile_image_url} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-slate-700" />
        ) : <span className="text-slate-600">N/A</span>;
      case 'sharedConnectionsCount':
        return <span className="font-mono text-slate-300">{lead.shared_connections_count || 0}</span>;
      case 'name':
        return <span className="font-medium text-slate-200">{lead.name || lead.full_name || 'N/A'}</span>;
      case 'vmid':
        return <span className="font-mono text-slate-400 text-[11px]">{lead.vmid || 'N/A'}</span>;
      case 'linkedInProfileUrl': {
        const url = lead.linkedin_profile_url || lead.profile_url;
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]">
            <Linkedin className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="truncate max-w-[120px]">{url.replace(/^https?:\/\/(www\.)?/, '')}</span>
          </a>
        ) : <span className="text-slate-600 italic">N/A</span>;
      }
      case 'isPremium':
        return (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lead.is_premium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'}`}>
            {lead.is_premium ? 'PREMIUM' : 'NO'}
          </span>
        );
      case 'isOpenLink':
        return (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lead.is_open_link ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'}`}>
            {lead.is_open_link ? 'OPEN' : 'NO'}
          </span>
        );
      case 'query':
        return <span className="text-slate-400 text-[11px] truncate max-w-[110px] block">{lead.query || 'N/A'}</span>;
      case 'timestamp':
        return <span className="text-slate-400 text-[11px]">{lead.timestamp || (lead.collected_at ? new Date(lead.collected_at).toLocaleDateString() : 'N/A')}</span>;
      case 'defaultProfileUrl': {
        const url = lead.default_profile_url || lead.google_maps_url;
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[130px] block font-mono text-[11px]">
            {url.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        ) : <span className="text-slate-600 italic">N/A</span>;
      }
      case 'searchAccountProfileId':
        return <span className="font-mono text-slate-400 text-[11px]">{lead.search_account_profile_id || 'N/A'}</span>;
      case 'searchAccountProfileName':
        return <span className="text-slate-300 text-[11px]">{lead.search_account_profile_name || 'N/A'}</span>;
      case 'sys3Status':
        return (
          <select
            value={lead.sys3_status || lead.lead_status || 'New'}
            onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
            className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 bg-slate-950 focus:outline-none cursor-pointer ${
              statusBadgeColors[lead.lead_status] || statusBadgeColors['New']
            }`}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Interested">Interested</option>
            <option value="Converted">Converted</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        );
      default:
        return null;
    }
  };

  // Determine active columns depending on viewMode
  let activeColumns = [];
  if (viewMode === 'all_35') {
    activeColumns = ALL_35_COLUMNS;
  } else if (viewMode === 'linkedin') {
    activeColumns = ALL_35_COLUMNS.filter(c => [
      'fullName', 'title', 'companyName', 'industry', 'location', 'connectionDegree', 
      'linkedInProfileUrl', 'isPremium', 'isOpenLink', 'sys3Status'
    ].includes(c.id));
  } else if (viewMode === 'standard') {
    activeColumns = ALL_35_COLUMNS.filter(c => [
      'companyName', 'fullName', 'title', 'industry', 'location', 'companyUrl', 'sys3Status'
    ].includes(c.id));
  } else {
    // Custom selection
    activeColumns = ALL_35_COLUMNS.filter(c => visibleColumns.includes(c.id));
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Toolbar Header with View Mode Switcher */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-blue-400" />
            Columns View Mode:
          </span>
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('all_35')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'all_35' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All 35 Scraper Columns
            </button>
            <button
              onClick={() => setViewMode('standard')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'standard' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard Compact View
            </button>
            <button
              onClick={() => setViewMode('linkedin')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'linkedin' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Linkedin className="w-3 h-3" />
              LinkedIn Profile View
            </button>
            <button
              onClick={() => setViewMode('custom')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'custom' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Custom Selection
            </button>
          </div>
        </div>

        {/* Column Picker Trigger */}
        {viewMode === 'custom' && (
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              Select Columns ({visibleColumns.length}/35)
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto space-y-1 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-white">
                  <span>Toggle Display Columns</span>
                  <button 
                    onClick={() => setVisibleColumns(ALL_35_COLUMNS.map(c => c.id))}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Select All
                  </button>
                </div>
                {ALL_35_COLUMNS.map((col) => (
                  <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-800/60 rounded cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.id)}
                      onChange={() => toggleColumn(col.id)}
                      className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="font-mono">{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 tracking-wider font-mono text-[11px]">
            <tr>
              <th className="p-3 w-10 sticky left-0 z-10 bg-slate-950 border-r border-slate-800/60">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              
              {/* Dynamic 35 Scraper Columns */}
              {activeColumns.map((col) => (
                <th 
                  key={col.id} 
                  className="p-3 border-r border-slate-800/40 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSortClick(col.id === 'companyName' ? 'company_name' : col.id)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {sortBy === (col.id === 'companyName' ? 'company_name' : col.id) && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}

              {/* General Phone & Email Columns in Non-35 Modes if omitted */}
              {viewMode !== 'all_35' && (
                <>
                  <th className="p-3 border-r border-slate-800/40">Phone</th>
                  <th className="p-3 border-r border-slate-800/40">Email</th>
                </>
              )}

              <th className="p-3 text-right sticky right-0 z-10 bg-slate-950 border-l border-slate-800/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 3} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Globe className="w-8 h-8 text-slate-600 mb-1" />
                    <p className="font-medium text-slate-400">No verified business leads found</p>
                    <p className="text-xs text-slate-500">Perform a search to populate lead profile records.</p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 sticky left-0 z-10 bg-slate-900 border-r border-slate-800/60">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectLead(lead.id)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Active 35 Columns */}
                    {activeColumns.map((col) => (
                      <td key={col.id} className="p-3 border-r border-slate-800/40">
                        {renderCellContent(lead, col.id)}
                      </td>
                    ))}

                    {/* Phone & Email fallbacks for non-all_35 modes */}
                    {viewMode !== 'all_35' && (
                      <>
                        <td className="p-3 border-r border-slate-800/40 font-mono text-slate-300">
                          {(lead.phone_number || lead.phone) && (lead.phone_number || lead.phone) !== 'Not Available' ? (
                            <div className="flex items-center gap-1.5 group">
                              <span>{lead.phone_number || lead.phone}</span>
                              <button
                                onClick={() => onCopyText(lead.phone_number || lead.phone, 'Phone number')}
                                title="Copy Phone"
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-400 transition-opacity"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">N/A</span>
                          )}
                        </td>
                        <td className="p-3 border-r border-slate-800/40 font-mono text-slate-300">
                          {lead.email && lead.email !== 'Not Available' ? (
                            <div className="flex items-center gap-1.5 group">
                              <span className="text-blue-400 font-medium truncate max-w-[150px]" title={lead.email}>
                                {lead.email}
                              </span>
                              <button
                                onClick={() => onCopyText(lead.email, 'Business email')}
                                title="Copy Email"
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-400 transition-opacity shrink-0"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">N/A</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="p-3 text-right sticky right-0 z-10 bg-slate-900 border-l border-slate-800/60">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewLead(lead)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(lead.company_url || lead.website) && (lead.company_url || lead.website) !== 'Not Available' && (
                          <a
                            href={lead.company_url || lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Website"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          title="Delete Lead"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span className="font-semibold text-white">{page}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span> ({totalItems} leads)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTable;
