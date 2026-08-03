import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SavedSearchCard from '../components/SavedSearchCard';
import Toast from '../components/Toast';
import { searchService } from '../services/api';
import { Bookmark, Search } from 'lucide-react';

const SavedSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  const fetchSearches = async () => {
    try {
      const data = await searchService.getSavedSearches();
      setSearches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved search?')) return;
    try {
      await searchService.deleteSearch(id);
      setSearches((prev) => prev.filter((s) => s.id !== id));
      setToast({ message: 'Saved search deleted', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to delete saved search', type: 'error' });
    }
  };

  const handleRerun = (search) => {
    navigate('/find-leads', { state: { rerunParams: search } });
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <Bookmark class="w-5 h-5 text-blue-400" />
            <h2 class="text-lg font-bold text-white">Saved Lead Searches</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Access your bookmarked regional lead search criteria and rerun anytime
          </p>
        </div>
        <span class="text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg">
          {searches.length} Searches Saved
        </span>
      </div>

      {loading ? (
        <div class="p-12 text-center text-slate-500">Loading saved searches...</div>
      ) : searches.length === 0 ? (
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <Search class="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 class="text-base font-bold text-slate-300">No Saved Searches Found</h3>
          <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When you perform lead searches on the Dashboard, they are saved here automatically for quick re-execution.
          </p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {searches.map((search) => (
            <SavedSearchCard
              key={search.id}
              search={search}
              onRerun={handleRerun}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default SavedSearches;
