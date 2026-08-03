import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SavedSearches from './pages/SavedSearches';
import AllLeads from './pages/AllLeads';
import Exports from './pages/Exports';
import Settings from './pages/Settings';

const ProtectedLayout = ({ children, searchQuery, setSearchQuery }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div class="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Lead Finder...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div class="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div class="flex-1 flex flex-col min-w-0">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main class="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Dashboard searchQuery={searchQuery} />
          </ProtectedLayout>
        }
      />
      <Route
        path="/find-leads"
        element={
          <ProtectedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Dashboard searchQuery={searchQuery} />
          </ProtectedLayout>
        }
      />
      <Route
        path="/saved-searches"
        element={
          <ProtectedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <SavedSearches />
          </ProtectedLayout>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <AllLeads searchQuery={searchQuery} />
          </ProtectedLayout>
        }
      />
      <Route
        path="/exports"
        element={
          <ProtectedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Exports />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Settings />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
