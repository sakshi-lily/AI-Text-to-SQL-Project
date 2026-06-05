import React, { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, Loader2, ArrowLeft, KeyRound, Server } from 'lucide-react';
import { testConnection, connectDatabase } from '../utils/api';

interface ConnectionPageProps {
  onBack: () => void;
  onConnectSuccess: (dbName: string) => void;
}

export default function ConnectionPage({ onBack, onConnectSuccess }: ConnectionPageProps) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('university_registrar');
  const [username, setUsername] = useState('student_admin');
  const [password, setPassword] = useState('••••••••');
  
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setStatus({ type: null, message: '' });
    
    try {
      const res = await testConnection({ host, port, database, username, password });
      if (res.success) {
        setStatus({ type: 'success', message: res.message });
      } else {
        setStatus({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to communicate with connection service.' });
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setStatus({ type: null, message: '' });
    
    try {
      const res = await connectDatabase({ host, port, database, username, password });
      if (res.success) {
        onConnectSuccess(res.database || database);
      } else {
        setStatus({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Connection failed.' });
    } finally {
      setConnecting(false);
    }
  };

  const handleQuickConnect = async () => {
    setConnecting(true);
    setStatus({ type: null, message: '' });
    
    const localParams = {
      host: 'local-sqlite',
      port: '3306',
      database: 'university_registrar',
      username: 'sqlite_user',
      password: 'local_password'
    };
    
    try {
      const res = await connectDatabase(localParams);
      if (res.success) {
        onConnectSuccess(res.database || 'university_registrar');
      } else {
        setStatus({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to establish SQLite connection.' });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-6 bg-grid-pattern relative transition-colors duration-300">
      
      {/* Decorative glows */}
      <div className="absolute w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[80px] top-[10%] left-[25%] pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[80px] bottom-[10%] right-[25%] pointer-events-none" />

      {/* Connection Card Container */}
      <div className="w-full max-w-xl glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl relative z-10 animate-fade-in">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors uppercase tracking-wider mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Landing
        </button>

        {/* Heading */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight dark:text-white">Database Credentials</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure connection metrics to establish active AI query tunnel.</p>
          </div>
        </div>

        {/* Status Alerts */}
        {status.type && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
            status.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-semibold leading-relaxed">{status.message}</div>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-5">
          {/* Host & Port grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Host Server</label>
              <input
                type="text"
                value={host}
                onChange={e => setHost(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                placeholder="e.g. localhost"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Port</label>
              <input
                type="text"
                value={port}
                onChange={e => setPort(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                placeholder="5432"
              />
            </div>
          </div>

          {/* Database Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Database Name</label>
            <input
              type="text"
              value={database}
              onChange={e => setDatabase(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              placeholder="e.g. university_db"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              placeholder="e.g. admin"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase tracking-wider"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                placeholder="Password"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || connecting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </button>
            
            <button
              type="submit"
              disabled={testing || connecting}
              className="w-full sm:flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Database'
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800/80" />
          </div>
          <span className="relative z-10 px-3 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Quick Connect local SQLite bypass */}
        <button
          onClick={handleQuickConnect}
          disabled={testing || connecting}
          className="w-full py-3.5 rounded-xl text-sm font-bold border border-dashed border-blue-300 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          Quick Connect Local SQLite Database
        </button>

      </div>
    </div>
  );
}
