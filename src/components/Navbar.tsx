import { useState } from 'react';
import { Sun, Moon, Database, Settings2, Key, Check, Info, ShieldCheck } from 'lucide-react';
import type { ConnectionStatus } from '../utils/api';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  connectionStatus: ConnectionStatus;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  activeTab: 'workspace' | 'explorer' | 'analytics' | 'settings';
  onActiveTabChange: (tab: 'workspace' | 'explorer' | 'analytics' | 'settings') => void;
}

export default function Navbar({
  darkMode,
  onToggleDarkMode,
  connectionStatus,
  apiKey,
  onApiKeyChange,
  activeTab,
  onActiveTabChange
}: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onApiKeyChange(keyInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowSettings(false);
    }, 1000);
  };

  return (
    <>
      <nav className="w-full px-6 py-4 bg-white/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between relative z-25 transition-colors duration-300">
        
        {/* Left Side: Connection details */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Platform</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-500" />
              {connectionStatus.database || 'registrar_db'}
            </span>
          </div>
          
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Shield Active
          </span>
        </div>

        {/* Center: Tab switcher */}
        <div className="flex bg-slate-150 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-250/60 dark:border-slate-850/80 shadow-inner relative z-30">
          <button
            onClick={() => onActiveTabChange('workspace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/10 dark:border-slate-800/10'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            SQL Workspace
          </button>
          <button
            onClick={() => onActiveTabChange('explorer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
              activeTab === 'explorer'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/10 dark:border-slate-800/10'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Database Explorer
          </button>
          <button
            onClick={() => onActiveTabChange('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/10 dark:border-slate-800/10'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Performance Analytics
          </button>
          <button
            onClick={() => onActiveTabChange('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/10 dark:border-slate-800/10'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            AI Settings
          </button>
        </div>

        {/* Right Side: Theme + Settings */}
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
            apiKey 
              ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400' 
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400'
          }`}>
            <Key className="w-3.5 h-3.5" />
            {apiKey ? 'AI Active' : 'AI Offline'}
          </span>

          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 dark:hover:text-white hover:text-slate-800 transition-all cursor-pointer"
            title="Toggle Theme Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onActiveTabChange('settings')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 dark:hover:text-white hover:text-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            title="Configure AI Parameters"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">AI Settings</span>
          </button>
        </div>

      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl relative">
            <h3 className="text-lg font-black tracking-tight dark:text-white mb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              Configure AI Translator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Optionally provide your Google Gemini API Key to enable advanced LLM-based SQL translation.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gemini API Key</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  placeholder="Enter API Key (starts with AIzaSy...)"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/10 text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Your key is stored securely in your browser's local storage.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </>
                  ) : (
                    'Save Configurations'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
