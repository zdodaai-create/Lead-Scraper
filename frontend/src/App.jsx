import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import SavedSearches from './pages/SavedSearches';
import AllLeads from './pages/AllLeads';
import Exports from './pages/Exports';
import Settings from './pages/Settings';

const AppLayout = ({ children, searchQuery, setSearchQuery }) => {
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
      <Route
        path="/"
        element={
          <AppLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Dashboard searchQuery={searchQuery} />
          </AppLayout>
        }
      />
      <Route
        path="/login"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/find-leads"
        element={
          <AppLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Dashboard searchQuery={searchQuery} />
          </AppLayout>
        }
      />
      <Route
        path="/saved-searches"
        element={
          <AppLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <SavedSearches />
          </AppLayout>
        }
      />
      <Route
        path="/leads"
        element={
          <AppLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <AllLeads searchQuery={searchQuery} />
          </AppLayout>
        }
      />
      <Route
        path="/exports"
        element={
          <AppLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Exports />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Settings />
          </AppLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
