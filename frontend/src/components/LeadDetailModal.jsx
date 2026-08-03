import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Phone, Mail, MapPin, Star, Calendar, ShieldCheck, Edit3, Save, AlertTriangle, Link as LinkIcon } from 'lucide-react';

const LeadDetailModal = ({ lead, onClose, onSaveNotes, onUpdateStatus }) => {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('New');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
      setStatus(lead.lead_status || 'New');
    }
  }, [lead]);

  if (!lead) return null;

  const handleSave = () => {
    onSaveNotes(lead.id, notes);
    onUpdateStatus(lead.id, status);
    setIsEditingNotes(false);
  };

  return (
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              {lead.company_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-white leading-tight">{lead.company_name}</h3>
                {lead.is_demo && (
                  <span class="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                    DEMO DATA
                  </span>
                )}
              </div>
              <span class="text-xs text-blue-400 font-medium">{lead.category}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div class="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status & Quick Metrics */}
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <div class="text-[11px] text-slate-400 uppercase font-semibold">Lead Status</div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  onUpdateStatus(lead.id, e.target.value);
                }}
                class="mt-1 bg-slate-900 text-xs font-semibold text-blue-400 border border-blue-500/30 rounded px-2 py-1 w-full focus:outline-none cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Interested">Interested</option>
                <option value="Converted">Converted</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            <div>
              <div class="text-[11px] text-slate-400 uppercase font-semibold">Rating</div>
              <div class="mt-1 text-sm font-bold text-amber-400 flex items-center gap-1">
                <Star class="w-4 h-4 fill-amber-400" />
                <span>{lead.rating ? lead.rating.toFixed(1) : 'N/A'}</span>
                <span class="text-xs text-slate-500 font-normal">({lead.review_count})</span>
              </div>
            </div>

            <div>
              <div class="text-[11px] text-slate-400 uppercase font-semibold">Source</div>
              <div class="mt-1 text-xs text-slate-300 font-medium truncate" title={lead.source}>
                {lead.source}
              </div>
            </div>

            <div>
              <div class="text-[11px] text-slate-400 uppercase font-semibold">Collected At</div>
              <div class="mt-1 text-xs text-slate-300 font-medium">
                {lead.collected_at ? new Date(lead.collected_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Place Verification Details */}
          <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              Source Verification & Audit Metadata
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <span class="text-slate-500 block text-[11px]">Google Place ID:</span>
                <span class="font-mono text-emerald-400 font-semibold break-all">
                  {lead.provider_place_id || 'Not Available'}
                </span>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Google Maps URL:</span>
                {lead.google_maps_url ? (
                  <a
                    href={lead.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink class="w-3 h-3" />
                  </a>
                ) : (
                  <span class="text-slate-500 italic">Not Available</span>
                )}
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Email Source Page:</span>
                {lead.email_source_url ? (
                  <a
                    href={lead.email_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-400 hover:underline truncate block font-medium"
                    title={lead.email_source_url}
                  >
                    {lead.email_source_url}
                  </a>
                ) : (
                  <span class="text-slate-500 italic">Not Published on Public Website</span>
                )}
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Audit Mode:</span>
                <span className={lead.is_demo ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {lead.is_demo ? 'DEMO DATA MODE' : 'LIVE GOOGLE PLACES API'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Contact Information</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
                <Phone class="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div class="text-slate-500">Public Phone</div>
                  <div class="font-mono text-slate-200 font-semibold">{lead.phone || 'Not Available'}</div>
                </div>
              </div>

              <div class="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
                <Mail class="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div class="text-slate-500">Public Business Email</div>
                  <div class="font-medium text-blue-400 font-mono truncate max-w-[200px]" title={lead.email}>
                    {lead.email || 'Not Available'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Website */}
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Location & Website</h4>
            <div class="space-y-3 text-xs">
              <div class="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-start gap-3">
                <MapPin class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div class="text-slate-500">Full Business Address</div>
                  <div class="text-slate-200 font-medium mt-0.5">{lead.address}</div>
                  {lead.city && (
                    <div class="text-slate-400 mt-1">
                      {lead.city}, {lead.state || ''} {lead.country || 'India'}
                    </div>
                  )}
                </div>
              </div>

              {lead.website && lead.website !== 'Not Available' && (
                <div class="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <ExternalLink class="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div class="text-slate-500">Official Business Website</div>
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-400 hover:underline font-medium"
                      >
                        {lead.website}
                      </a>
                    </div>
                  </div>

                  {lead.contact_page_url && (
                    <a
                      href={lead.contact_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded hover:bg-blue-500/20 transition-colors"
                    >
                      Contact Page
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes Section */}
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Internal Lead Notes</h4>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  class="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                  Edit Notes
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div class="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about conversations, follow-up dates, custom budget info..."
                  rows="4"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                ></textarea>
                <div class="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    class="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-blue-600/20"
                  >
                    <Save class="w-3.5 h-3.5" />
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className={`bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs min-h-[70px] ${
                notes ? 'text-slate-200' : 'text-slate-600 italic'
              }`}>
                {notes || 'No notes added yet for this lead.'}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div class="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-500">Database ID: #{lead.id}</span>
          <button
            onClick={onClose}
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
