import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('demo@leadfinder.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        {/* Brand Header */}
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/30 mb-3">
            <Sparkles class="w-6 h-6" />
          </div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">LEAD FINDER</h1>
          <p class="text-xs text-slate-400 mt-1">Enterprise Business Discovery & Website Enrichment</p>
        </div>

        {/* Login Card */}
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 class="text-lg font-bold text-white mb-6">Sign In to Dashboard</h2>

          {error && (
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div class="relative">
                <Mail class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div class="relative">
                <Lock class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight class="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-slate-800 text-center">
            <p class="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" class="text-blue-400 font-semibold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        <div class="mt-6 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck class="w-4 h-4 text-emerald-400" />
          <span>Protected with SSRF Guard & Official Places API</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
