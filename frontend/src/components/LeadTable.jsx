import React from 'react';
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
  AlertTriangle
} from 'lucide-react';

const statusBadgeColors = {
  New: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Follow Up': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Interested: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Converted: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Not Interested': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

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
  const isAllSelected = leads.length > 0 && leads.every((l) => selectedLeadIds.includes(l.id));

  const handleSortClick = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  return (
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 tracking-wider">
            <tr>
              <th class="p-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  class="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th
                class="p-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSortClick('company_name')}
              >
                <div class="flex items-center gap-1">
                  <span>Company Name</span>
                  {sortBy === 'company_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th class="p-4">Category</th>
              <th class="p-4">Phone</th>
              <th class="p-4">Email</th>
              <th class="p-4">Website</th>
              <th class="p-4">Location</th>
              <th
                class="p-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSortClick('rating')}
              >
                <div class="flex items-center gap-1">
                  <span>Rating</span>
                  {sortBy === 'rating' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th
                class="p-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSortClick('review_count')}
              >
                <div class="flex items-center gap-1">
                  <span>Reviews</span>
                  {sortBy === 'review_count' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th class="p-4">Status</th>
              <th class="p-4">Verification / Source</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            {leads.length === 0 ? (
              <tr>
                <td colSpan="12" class="p-12 text-center text-slate-500">
                  <div class="flex flex-col items-center gap-2">
                    <Globe class="w-8 h-8 text-slate-600 mb-1" />
                    <p class="font-medium text-slate-400">No verified business leads found</p>
                    <p class="text-xs text-slate-500">Enter a location and category above to perform a live Google Places search.</p>
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
                      isSelected ? 'bg-blue-600/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td class="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectLead(lead.id)}
                        class="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Company Name */}
                    <td class="p-4 font-semibold text-white">
                      <div class="flex items-center gap-2">
                        <span class="max-w-[180px] truncate" title={lead.company_name}>
                          {lead.company_name}
                        </span>
                        {lead.is_demo && (
                          <span class="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                            DEMO DATA
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td class="p-4 text-slate-400">
                      <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                        {lead.category}
                      </span>
                    </td>

                    {/* Phone */}
                    <td class="p-4 font-mono text-slate-300">
                      {lead.phone && lead.phone !== 'Not Available' ? (
                        <div class="flex items-center gap-1.5 group">
                          <span>{lead.phone}</span>
                          <button
                            onClick={() => onCopyText(lead.phone, 'Phone number')}
                            title="Copy Phone"
                            class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-400 transition-opacity"
                          >
                            <Copy class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span class="text-slate-600 italic">Not Available</span>
                      )}
                    </td>

                    {/* Email */}
                    <td class="p-4">
                      {lead.email && lead.email !== 'Not Available' ? (
                        <div class="flex items-center gap-1.5 group">
                          <span class="text-blue-400 font-medium truncate max-w-[160px]" title={lead.email}>
                            {lead.email}
                          </span>
                          <button
                            onClick={() => onCopyText(lead.email, 'Business email')}
                            title="Copy Email"
                            class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-400 transition-opacity shrink-0"
                          >
                            <Copy class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span class="text-slate-600 italic">Not Available</span>
                      )}
                    </td>

                    {/* Website */}
                    <td class="p-4">
                      {lead.website && lead.website !== 'Not Available' ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1 text-slate-300 hover:text-blue-400 transition-colors"
                        >
                          <span class="truncate max-w-[120px]">{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          <ExternalLink class="w-3 h-3 text-slate-500" />
                        </a>
                      ) : (
                        <span class="text-slate-600 italic">Not Available</span>
                      )}
                    </td>

                    {/* Location */}
                    <td class="p-4 text-slate-400">
                      <div class="flex items-center gap-1 max-w-[140px] truncate" title={lead.address}>
                        <MapPin class="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{lead.city || lead.address}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td class="p-4">
                      {lead.rating ? (
                        <div class="flex items-center gap-1 font-semibold text-amber-400">
                          <Star class="w-3.5 h-3.5 fill-amber-400" />
                          <span>{lead.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span class="text-slate-600">N/A</span>
                      )}
                    </td>

                    {/* Reviews */}
                    <td class="p-4 text-slate-400">
                      {lead.review_count ? lead.review_count.toLocaleString() : 0}
                    </td>

                    {/* Lead Status */}
                    <td class="p-4">
                      <select
                        value={lead.lead_status || 'New'}
                        onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                        className={`text-[11px] font-semibold border rounded-md px-2 py-1 bg-slate-950 focus:outline-none cursor-pointer ${
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
                    </td>

                    {/* Verification Source */}
                    <td class="p-4 text-[11px]">
                      {lead.is_demo ? (
                        <span class="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <AlertTriangle class="w-3 h-3" />
                          Demo Data
                        </span>
                      ) : lead.provider_place_id ? (
                        <span class="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20" title={`Place ID: ${lead.provider_place_id}`}>
                          <ShieldCheck class="w-3 h-3" />
                          Google Places
                        </span>
                      ) : (
                        <span class="text-slate-500">Manual</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td class="p-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewLead(lead)}
                          title="View Details"
                          class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Eye class="w-4 h-4" />
                        </button>

                        {lead.website && lead.website !== 'Not Available' && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Website"
                            class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Globe class="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          title="Delete Lead"
                          class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Trash2 class="w-4 h-4" />
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
        <div class="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span class="font-semibold text-white">{page}</span> of{' '}
            <span class="font-semibold text-white">{totalPages}</span> ({totalItems} leads)
          </div>
          <div class="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
